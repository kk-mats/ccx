export interface TemporaryStoreRepository {
	pluginsRoot(): string;

	saveTemporaryPlugin(): void;
}
