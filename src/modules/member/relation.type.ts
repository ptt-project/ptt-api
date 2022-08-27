
export type InquiryMemberRelationType = (
  memberId: number,
  level: number,
) => Promise<[any, string]>
