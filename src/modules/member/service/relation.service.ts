import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { PinoLogger } from 'nestjs-pino'
import { Member } from 'src/db/entities/Member'
import { response } from 'src/utils/response'
import { UnableToGetMemberRelations } from 'src/utils/response-code'
import { EntityManager } from 'typeorm'
import { GetRelationRequestDto } from '../dto/relation.dto'
import { InquiryMemberRelationType } from '../type/relation.type'

@Injectable()
export class RelationService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(RelationService.name)
  }

  GetRelationHandler(getRelation: Promise<InquiryMemberRelationType>) {
    return async (member: Member, query: GetRelationRequestDto) => {
      const start = dayjs()
      const {level = 3} = query
      const [relations, getRelationError] = await (await getRelation)(member.id, level)

      if (getRelationError != '') {
        return response(undefined, UnableToGetMemberRelations, 'Unable to get member relations')
      }

      this.logger.info(`Done getRelationHandler ${dayjs().diff(start)} ms`)
      return response(relations)
    }
  }

  GetMemberRelation(memberMapping, memberId, currentLevel, maxLevel) {
    if (currentLevel == maxLevel) {
      return { ...memberMapping[memberId], level: currentLevel, children: [] } || {}
    }

    const memberData = memberMapping[memberId] || { children: [] }
    return {
      ...memberData,
      level: currentLevel,
      children: 
        memberData.children.map(
          (child) => this.GetMemberRelation(memberMapping, child, currentLevel + 1, maxLevel)
        ),
    }
  }

  async InquiryMemberRelationFunc(
    etm: EntityManager
  ): Promise<InquiryMemberRelationType> {
    return async (memberId: string, level: number): Promise<[any, string]> => {
      const start = dayjs()
      let relationTree: any = {}
      const relationTable: any = []
      try {
        const memberMapping = {}
        const members = await etm.find(Member, { where: {
          deletedAt: null
        }})
        members.forEach((member) => {
          memberMapping[member.id] = {
            name: member.username,
            children: member.relationIds,
          }
        })

        relationTree = this.GetMemberRelation(memberMapping, memberId, 0, level)

        const travelTrack = [{memberId, memberLevel: 0}]
        while (travelTrack.length) {
          const {memberId: currentMemberId, memberLevel} = travelTrack.shift()
          if (memberLevel > 0) {
            relationTable.push({
              username: memberMapping[currentMemberId].name,
              level: memberLevel
            })
          }
          if (memberLevel < level) {
            travelTrack.push(
              ...memberMapping[currentMemberId].children.map(
                r => ({memberId: r, memberLevel: memberLevel + 1})
              )
            )
          }
        }

      } catch (error) {
        return [null,  error]
      }

      this.logger.info(`Done InquiryMemberRelationFunc ${dayjs().diff(start)} ms`)
      return [{ relationTree, relationTable }, '']
    }
  }
}