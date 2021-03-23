import GitBranchName from "common/all/types/GitBranchName";

// ToDo: should validate given branch name ?
export default function createGitBranchName(value: string): GitBranchName {
	return value as GitBranchName;
}
