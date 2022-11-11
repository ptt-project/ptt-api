
export type InquiryMemberRelationType = (
  memberId: string,
  level: number,
) => Promise<[any, string]>
