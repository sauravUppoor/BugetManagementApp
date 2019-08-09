//BUDGET CONTROLLER
var budgetController = (function() {

    //function constructor for expense
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentages = function(totalIncome) {

        if(totalIncome > 0) {
            this.percentage = Math.floor(this.value / totalIncome * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentages = function() {
        return this.percentage;
    }

    //function constructor for income
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    //data structure  
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    } 
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.total[type] = sum;
    } 
    return{
        
        addItem: function(type, desc, val) {
            var dataItem, ID;
            //setting up IDs for various items inputted
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            }
            
            //adding items to the array of instances using the above function constructors
            if (type === 'exp') {
                var dataItem = new Expense (ID, desc, val);
            } else if (type === 'inc') {
                var dataItem = new Income (ID, desc, val);
            }
            data.allItems[type].push(dataItem);
            
            //returning the data item
            return dataItem;  
        },
        deleteItem: function(type, id) {
            var index, ids;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function() {
            //calculate total income and expense
            calculateTotal('inc');
            calculateTotal('exp');

            //calculate budget = income - expense
            data.budget = data.total.inc - data.total.exp;

            //calculate percentage
            if(data.total.inc > 0 && data.total.exp > 0) {
                data.percentage = Math.floor(data.total.exp / data.total.inc * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        getBudget: function() {
            return {
                budget: data.budget,
                incTotal: data.total.inc,
                expTotal: data.total.exp,
                percentage: data.percentage

            }
        },
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentages(data.total.inc);
            });
        },
        getPercentages: function() {
            var percentage = data.allItems.exp.map(function(cur){
                return cur.getPercentages();
            });
            return percentage;
        },
        testing: function() {
            return data;
        }
    }
})();


//UI CONTROLLER
var UIController = (function() {
    var DOMStrings = {
        addType: '.add__type',
        addDescription: '.add__description',
        addValue: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentages: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var numberFormat = function(num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        
        int = numSplit[0];

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + int + '.' + dec;
    }
     /* field is a list of nodes and inorder to iterate in the list of nodes wee do not have a forEach function. Thus we will create out own ForEach for node LIsts */

    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
        getInput: function() {
            return {
                inputType: document.querySelector(DOMStrings.addType).value, //inc or exp
                inputDescription: document.querySelector(DOMStrings.addDescription).value,
                inputValue: parseFloat(document.querySelector(DOMStrings.addValue).value),
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element, field, fieldsArr;

            //Create html string for placeholder
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // add placehoder text to the html string
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', numberFormat(obj.value, type));

            //add it to the UI
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

            //reset the text field
            field = document.querySelectorAll(DOMStrings.addDescription + ',' + DOMStrings.addValue);
            //converting the field, which is a list, to an array
            fieldArr = Array.prototype.slice.call(field);
            //using foreach method to clear the field
            fieldArr.forEach(function(current) {
                current.value = '';
            });

            fieldArr[0].focus();
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector (DOMStrings.budgetLabel).textContent = numberFormat(obj.budget, type);
            document.querySelector (DOMStrings.incomeLabel).textContent = numberFormat(obj.incTotal, 'inc');
            document.querySelector (DOMStrings.expenseLabel).textContent = numberFormat(obj.expTotal, 'exp');

            if(obj.percentage > 0) {
                document.querySelector (DOMStrings.percentages).textContent = obj.percentage+ '%';

            } else {
                document.querySelector (DOMStrings.percentages).textContent = '---';

            }
        },

        updatePercUI: function(percentages) {
           var fields;
           fields = document.querySelectorAll(DOMStrings.itemPercentage);

          

           nodeListForEach(fields, function(element, index) {
               if(percentages[index] > 0) {
                    element.textContent = percentages[index] + '%';
               } else {
                    element.textContent = '---';
               }
               
           });

        },

        displayDate: function() {
            var now, month, year, months;
            now = new Date();

            months = ['January', 'Februrary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = months[now.getMonth()];

            year = now.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = month +', ' + year;

        },

        changedType: function() {
            var fields;
            fields = document.querySelectorAll(
                DOMStrings.addType + ',' +
                DOMStrings.addDescription + ',' +
                DOMStrings.addValue 
            );
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            })
            document.querySelector(DOMStrings.addBtn).classList.toggle('red');
        },

        getDOMStrings: function() {
            return DOMStrings;
        }
        
    };
   
})();


//GLOBAL CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    var setupEventListener = function() {
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                //getInput();
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        UICtrl.displayBudget(
            {
                budget: 0,
                incTotal: 0,
                expTotal: 0,
                percentage: -1
            }
        );

        UICtrl.displayDate();
        document.querySelector(DOM.addType).addEventListener('change', UICtrl.changedType);
    }

    var ctrlBudgetValue = function() {
        var retBudget;
        //1. Calculate budget
        budgetCtrl.calculateBudget();
        //2. Return budget
        retBudget = budgetCtrl.getBudget();
        //3. Update the budget in the UI
        UICtrl.displayBudget(retBudget);
    }

    var ctrlDeleteItem = function(event) {
        var itemID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            //console.log(type, id);
            //1. delete item from our data structure
            budgetCtrl.deleteItem(type,id);
            //2. delete from ui
            UICtrl.deleteListItem(itemID);
            //3. calculate and update budget
            ctrlBudgetValue();
            //4. Calculate and update in=tem percentages
            updatePercentage();
        }

    }

    var ctrlAddItem = function() {
        var input, newItem;

        //1. Get iput field data
        input = UICtrl.getInput();

        if (input.inputDescription !== '' && !isNaN(input.inputValue) && input.inputValue > 0) {
            //2. Add items to the budget controller
            newItem = budgetCtrl.addItem(input.inputType, input.inputDescription, input.inputValue);
            //3. Add item to the UI
            UICtrl.addListItem(newItem, input.inputType);
            //4. Calculate budget and update call
            ctrlBudgetValue();
            //5. Calclate nd update percentages
            updatePercentage();
        }   
    }

    var updatePercentage = function() {
        var perc;
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Get the percentages from the budget controller
        perc = budgetCtrl.getPercentages();
        // 3. update the UI
        UICtrl.updatePercUI(perc);

    }

    

    return {
        init: function() {
            return setupEventListener();
        }
    };
})(budgetController, UIController);

controller.init();