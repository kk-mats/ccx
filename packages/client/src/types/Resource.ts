type State<R> =
	| {
			status: "fulfilled";
			value: R;
	  }
	| {
			status: "rejected";
			error: unknown;
	  }
	| {
			status: "pending";
			suspender: Promise<R>;
	  };

export default class Resource<R> {
	private state: State<R>;

	constructor(promise: () => Promise<R>) {
		const suspender = promise().then(
			(value) => {
				this.state = {
					status: "fulfilled",
					value
				};
				return value;
			},
			(error) => {
				this.state = {
					status: "rejected",
					error
				};

				throw error;
			}
		);

		this.state = {
			status: "pending",
			suspender
		};
	}

	public read(): R {
		if (this.state.status === "fulfilled") {
			return this.state.value;
		}

		if (this.state.status === "rejected") {
			throw this.state.error;
		}
		throw this.state.suspender;
	}
}
