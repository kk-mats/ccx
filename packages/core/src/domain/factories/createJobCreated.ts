import JobStarted from "common/all/types/JobStarted";

export default function createJobCreated(date: Date): JobStarted {
	return date as JobStarted;
}
