import { type ObjectDate } from '../entities/task'

export const formatObjectDate = ({ year, month, day, hour, minute }: ObjectDate): Date => new Date(year, month, day, hour, minute)
