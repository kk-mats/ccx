import JobDispatched from "common/all/types/JobDispatched";

export default function createJobDispatched(date: Date): JobDispatched {
	return date as JobDispatched;
}
