// BUDGET CONTROLLER
var budgetController = (function() {
	// expence constructor
	function Expence(id, des, val) {
		this.id = id;
		this.description = des;
		this.value = val;
		this.percentage = -1;
	}

	Expence.prototype.calcPercentage = function(totalIncome) {
		let percentage;

		percentage = (this.value/totalIncome) * 100;
		if (percentage > 0) {
			this.percentage = percentage;
		}
	};

	Expence.prototype.getPercentage = function(){
		return this.percentage;
	};

	// income constructor
	function Income(id, des, val) {
		this.id = id;
		this.description = des;
		this.value = val;
	}

	function calculateTotal(type) {
		let sum = 0;
		data.allItem[type].forEach(cur => 
			sum += cur.value
			);
		data.total[type] = sum;
	}

	// data structure
	var data = {
		allItem: {
			exp: [],
			inc: []
		},
		total: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addItem: function(type, des, val) {
			var newItem, id

			// create id
			if (data.allItem[type].length > 0){
				id = data.allItem[type][data.allItem[type].length - 1].id + 1;
			} else {
				id = 0;
			}

			// create new object based on type 'exp' or 'inc'
			if (type === 'exp'){
				newItem = new Expence(id, des, val);
			} else if (type === 'inc') {
				newItem = new Income(id, des, val);
			}

			// push the created object in data structure
			data.allItem[type].push(newItem);

			// return the created object
			return newItem;
		},

		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allItem[type].map(el => el.id);
			console.log(`ids ${ids}`);
			index = ids.indexOf(id);
			console.log(`index ${index}`);
			if (index !== -1){
				data.allItem[type].splice(index, 1);
			}
		},

		calculateBudget: function() {
			let percent;
			// calculate total income and expenses
			calculateTotal('inc');
			calculateTotal('exp');
			
			// calculate the budget: income - expenses
			data.budget = data.total.inc - data.total.exp;
			
			// calculate the percentage of income that we spent
			percent = Math.round((data.total.exp/data.total.inc) * 100);
			if (!isNaN(percent)) {
				data.percentage = percent; 
			}
		},

		calculatePercentage: function() {
			data.allItem.exp.forEach(cur => 
				cur.calcPercentage(data.total.inc)
				);
		},

		getPercentages: function() {
			return data.allItem.exp.map( function(element, index) {
				return element.getPercentage();
			});
		},

		getStatus: function() {
			return {
				inc: data.total.inc,
				exp: data.total.exp,
				budget: data.budget,
				percentage: data.percentage
			};
		},

		testing: function() {
			console.log(data);
		}
	};
})();


//UI CONTROLLER
var UIController = (function(){
	var DOMstring = {
		inputType: 			'.add__type',
		inputDescription: 	'.add__description',
		inputValue: 		'.add__value',
		inputBtn: 			'.add__btn',
		incomeContainer: 	'.income__list',
		expenseContainer: 	'.expenses__list',
		budgetIncome: 		'.budget__income--value',
		budgetExpense: 		'.budget__expenses--value',
		budgetExpensePerc: 	'.budget__expenses--percentage',
		budgetValue: 		'.budget__value',
		container: 			'.container',
		itemPercentage: 	'.item__percentage',
		item:  				'.item',
		dateLabel: 			'.budget__title--month',
		icon: 				'ion-ios-close-outline'
	};

	var formatNumString = function(type, num) {
		let splitNum, intPart, intPartFinal, fractionPart, track;
		
		intPartFinal = '';
		num = Math.abs(num).toFixed(2);
		splitNum = num.split('.');
		intPart = splitNum[0];
		fractionPart = splitNum[1];

		if (intPart.length > 3) {
			
			intPart = `${intPart.substring(0, intPart.length-3)},${intPart.substring(intPart.length-3)}`;
			// track = 0;
			// for (let i = Math.ceil(intPart.length/3)-1; i>=0; i--){
			// 	intPartFinal += `${intPart.substring(track, intPart.length-(3*i))},`;
			// 	track = intPart.length-(3*i);
			// }
			// intPartFinal += intPart.substring(intPart.length-3);
		}
		// console.log(intPartFinal);
		return type === 'exp' ? `- ${intPart}.${fractionPart}` : `+ ${intPart}.${fractionPart}`;
		// return type === 'exp' ? `- ${intPartFinal}.${fractionPart}` : `+ ${intPartFinal}.${fractionPart}`;
	};

	return {
		// pass the user input to controller
		getInput: function(){
			return {
				type: document.querySelector(DOMstring.inputType).value,
				description: document.querySelector(DOMstring.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstring.inputValue).value)
			};
		},

		addListItem: function(obj, type) {
			var html, newHtml, element;

			// create html string with placeholder text
			if (type === 'exp') {
				element = DOMstring.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'inc') {
				element = DOMstring.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			// replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumString(type, obj.value));

			// insert html into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearField: function() {
			/* clear the input fields */
			var fields, arrFields;

			// get the input fields to emply
			fields = document.querySelectorAll(DOMstring.inputDescription + ', ' + DOMstring.inputValue);

			// change list to array
			arrFields = Array.prototype.slice.call(fields);

			// clear all the field text
			arrFields.forEach(function(current, index, array) {
				current.value = '';
			});

			document.querySelector(DOMstring.inputType).value = 'inc';

			arrFields[0].focus();
		},

		displayBudget: function(obj) {
			let type;
			obj.inc = formatNumString('inc', obj.inc);
			obj.exp = formatNumString('exp', obj.exp);

			obj.budget<0 ? type = 'exp' : type = 'inc';
			obj.budget = formatNumString(type, obj.budget);

			document.querySelector(DOMstring.budgetIncome).innerHTML = obj.inc;
			document.querySelector(DOMstring.budgetExpense).innerHTML = obj.exp;
			document.querySelector(DOMstring.budgetValue).innerHTML = obj.budget;
			if (obj.percentage > 0) {
				document.querySelector(DOMstring.budgetExpensePerc).innerHTML = `${obj.percentage}%`;
			} else {
				document.querySelector(DOMstring.budgetExpensePerc).innerHTML = '---'
			}
		},

		displayPercentage: function(percentages) {
			let fields = document.querySelectorAll(DOMstring.itemPercentage);
			fields.forEach( function(element, index) {
				// statements
				if (percentages[index] > 0) {
					element.innerHTML = `${Math.round(percentages[index])}%`;
				}else{
					element.innerHTML = `---`;
				}

			});
		},

		displayMonth: function() {
			let now, year, month, months;

			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			document.querySelector(DOMstring.dateLabel).innerHTML = `${months[month]} ${year}`;
		},

		// pass DOM string to other method
		getDOMstring: function() {
			return DOMstring;
		}
	};

})(); 


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
	// get DOM string from UI controller
	var DOMstring = UICtrl.getDOMstring();

	// setup event listener
	// var setupEventListener = function() {
	function setupEventListener() {

		// mouse event
		document.querySelector(DOMstring.inputBtn).addEventListener('click', ctrlAddItem);
		
		// key press event
		document.addEventListener('keypress', function(event){
			console.log('keypress');
			if (event.key === 'Enter') {
				ctrlAddItem();
			}
		});
		document.querySelector(DOMstring.container).addEventListener('click', ctrlDeleteItem);
	}


	function updateBudget() {
		let status;

		budgetCtrl.calculateBudget();
		status = budgetCtrl.getStatus();
		UICtrl.displayBudget(status);
	}

	function updatePercentages() {
		// calculate the percentage for each expenses
		budgetCtrl.calculatePercentage();
		// get the percentage of each expenses
		var percentages = budgetCtrl.getPercentages();
		// display the percentage for each expenses
		console.log(`percentages ${percentages}`);

		UICtrl.displayPercentage(percentages);
	}

	// var ctrlAddItem = function() {
	function ctrlAddItem() {
		var input, newItem, status;
		// get the user input
		input = UICtrl.getInput();

		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			budgetCtrl.calculateBudget();
			updateBudget();
			UICtrl.addListItem(newItem, input.type);
			UICtrl.clearField();
			console.log(input);
			updatePercentages();
		}
	}	

	function ctrlDeleteItem(event) {
		var itemId, splitId, type, ID
		console.log('in the ctrl delete item');
		const eventTarget = event.target;
		if (eventTarget.className.includes(DOMstring.icon)) {
			itemId = eventTarget.closest(DOMstring.item).id;
			
			// inc-0
			splitId = itemId.split('-');
			type = splitId[0];
			ID = parseInt(splitId[1]);

			budgetCtrl.deleteItem(type, ID);
			updateBudget();
			UICtrl.deleteListItem(itemId);
			updatePercentages();
		}
	}

	return {
		init: function() {
			updateBudget();
			UICtrl.displayMonth();
			setupEventListener();
		}
	};
	

})(budgetController, UIController);

controller.init();

// var budgetController = (function() {
// 	var x = 23;

// 	function add(a) {
// 		return x+a;
// 	}

// 	return {
// 		testPublic: function(b) {
// 			return add(b)
// 		}
// 	};
// })();

// var UIController = (function() {
// 	// some code

// 	//private var and methods

// 	// return an object, (this object property can 
// 	// access to private var and function as necessary)
// })();


// var controller = (function(budgetCtrl, UICtrl) {
// 	var z = budgetCtrl.testPublic(5);

// 	return {
// 		anotherPublic: function() {
// 			console.log(z);
// 		}
// 	};

// })(budgetController, UIController);
