const numberPad2 = (num: number): string => num.toString().padStart(2, "0");

const formatDate = (d: Date): string => {
	const year = d.getFullYear();
	const month = numberPad2(d.getMonth() + 1);
	const date = numberPad2(d.getDate());
	const hh = numberPad2(d.getHours());
	const mm = numberPad2(d.getMinutes());

	return `${year}/${month}/${date} ${hh}:${mm}`;
};

export default formatDate;
