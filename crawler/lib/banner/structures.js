(function(ex){
	var Term, School

	Term = function(){
		this.init(arguments[0])
		return this
	}
	Term.prototype.init = function(args){
		number = args[0]
		text = args[1]
		this.number = number
		this.text = text

		yearMatch = this.text ? this.text.match(/[0-9]{2,4}/) : undefined
		this.year = yearMatch ? parseInt(yearMatch[0], 10) : undefined
		this.season = this.text ? this.text.replace(''+this.year,'').trim().toLowerCase() : undefined
		this.year += this.year<100 ? 2000 : 0
		return this
	}

	Department = function(args){
		this.init(arguments[0])
		return this
	}
	Department.prototype.init = function(args){
		abbr = args[0]
		text = args[1]
		this.abbr = abbr
		this.text = text
	}

	ex.Term = Term
	ex.Department = Department
})(exports);