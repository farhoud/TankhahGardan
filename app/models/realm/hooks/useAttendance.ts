import { useQuery } from "@realm/react"
import { Attendance } from "../attendance"

export const useAttendance = () => {
  const groups = useQuery(Attendance, (res) => {
    return res.filtered("group != '' DISTINCT(group)")
  })

  return { groups }
}
