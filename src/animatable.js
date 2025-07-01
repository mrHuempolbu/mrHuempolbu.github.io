
export function PropertySimple(value, setValue_clb = 0, valueScope = window)
{
	this.value = value;
	this.setValue_clb = setValue_clb;
	this.valueScope = valueScope;
//	if (this.setValue_clb)
//		this.setValue_clb.call(this.valueScope, this.value);

	this.values = [value, value];
	this.duration = .5;
	this.time = NaN;

	this.get = function()
	{
		return this.values[1];
	}
	this.set = function(value, duration = .5, clb = 0, scope = window)
	{
		if (value == this.values[1])
			return;
		
		this.onFinished_clb = clb;
		this.onFinishedScope = scope;

		this.values[0] = this.value;
		this.values[1] = value;
		this.duration = duration;
		this.time = 0.;

		let id = window.app.updates.indexOf(this);
		if (id < 0)
			window.app.updates.push(this);
	}

	this.clear = function()
	{
		this.time = NaN;
		let id = window.app.updates.indexOf(this);
		window.app.updates.splice(id, 1);
		
		if (this.onFinished_clb)
			this.onFinished_clb.call(this.onFinishedScope);
	}

	this.update = function(dt)
	{
		if (isNaN(this.time))
			return;

		this.time += dt;
		let anim = this.time / this.duration;
		if (anim > 1.)
			anim = 1.;
		
		this.value = anim * (this.values[1] - this.values[0]) + this.values[0];

		if (this.setValue_clb)
			this.setValue_clb.call(this.valueScope, this.value);

		if (anim == 1.)
			this.clear();
	}
}

//deprecated unborn
function Property(value)
{
	this.keyframes = [{"time" : 0, "value" : value}];
	this.getNearestLeftKey = function(time)
	{
		let res = -1;
		for (let k in this.keyframes)
		{
			if (this.keyframes[k].time > time)
				break;
			res = k;
		}
		return res;
	};
	this.getValue = function(time)
	{
		if (this.keyframes.length == 1)
			return this.keyframes[0].value;
		
		let nearestLeft = this.getNearestLeftKey(time);
		if (nearestLeft == this.keyframes.length - 1)
			return this.keyframes[this.keyframes.length - 1].value;
		if (nearestLeft == -1)
			return this.keyframes[0].value;

		//just lerp
		let anim = (time - this.keyframes[nearestLeft].time);
		anim = anim / (this.keyframes[nearestLeft + 1].time - this.keyframes[nearestLeft].time);
		let value = anim *  (this.keyframes[nearestLeft + 1].value - this.keyframes[nearestLeft].value);
		value = value + this.keyframes[nearestLeft].value;
		return value;
	};
	this.insertKeyframe = function(time, value)
	{
		let nearestLeft = this.getNearestLeftKey(time);
		let key = {"time" : time, "value" : value};
		this.keyframes.splice(nearestLeft + 1, 0, key);
	};
}
