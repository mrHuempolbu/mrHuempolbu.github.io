import year from "../public/data/iconicYear.json" with {type: "json"};

//seasons in seasonFilter: 0 — december to March inclusive, 1 — May to October inclusive, 2 — November and April
export function getData(sample, name, filters, tendency = "Sum")
{
	let res;
	if (sample == "by hour")
		res = Array.from({ length: 11 }, () => ({"datas" : [], "sum" : 0}));
	else if (sample == "by day")
		res = Array.from({ length: 7 }, () => ({"datas" : [], "sum" : 0}));
	else if (sample == "by month")
		res = Array.from({ length: 13 }, () => ({"sum" : 0}));
	else if (sample == "by season")
		res =  Array.from({ length: 2 }, () => ({"sum" : 0}));
	
	//I'm sorry for this.
	for (let m in year)
	{
		const month = year[m];
		if (!filters.season[month.season]) continue;
		if (!filters.month[m]) continue;

		for (let d in month.days)
		{
			const day = month.days[d];
			if (!filters.day[day.weekDay]) continue;
			if (!filters.season[day.season]) continue;
			if (sample == "by day")
				res[day.weekDay]["datas"].push(0);
			
			for (let h in day.hours)
			{
				const hour = day.hours[h];
				if (!filters.hour[h]) continue;

				let data = getSells(hour, name);
				if (sample === "by hour")
				{
					res[h]["datas"].push(data);
					res[h]["sum"] += data;
				}
				if (sample === "by day")
				{
					res[day.weekDay]["sum"] += data;
					res[day.weekDay]["datas"][res[day.weekDay].length - 1] += data;
				}
				if (sample === "by season")
					res[day.season]["sum"] += data;
				if (sample === "by month")
					res[m]["sum"] += data;
			}
		}
	}
	
	return res;
}


function getSells(hour, name)
{
	let res = 0;
	if (name == "Ladydrinks")
		return hour.ladydrinks;
	if (name == "Ringabells")
		return hour.ringabells;
	//When I parsed data, I have accidentally removed one zero. And converting baht to dollars.
	if (name == "Money")
		return Math.round(hour.money * 10 / 34.);

	for (const receipt in hour.receipts)
		for (const item in hour.receipts[receipt].items)
		{
			if (hour.receipts[receipt].items[item].name == name)
				res += 1;
		}

	return res;
}