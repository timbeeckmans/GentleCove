//lege (?) helpers, moeten verplicht gedeclareerd worden denk ik

module.exports = {
	section: function(name, options){
		if(!this._sections){
			this._sections = {};
		}
		this._sections[name] = options.fn(this);
		return null;
	}
};
