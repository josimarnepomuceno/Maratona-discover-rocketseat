 const Modal = {
    open(){
        document.querySelector('.modal-overlay')
        .classList.add('active'); // adicionar a classe 'active' no modal
    },
    close(){
        document.querySelector('.modal-overlay')
        .classList.remove('active'); // remove a classe 'active' no modal
    }
}

// Modal confirmação exclusão de registros do data-table
const ModalRemove = {
    open(){
        document.querySelector('.modal-overlay-remove')
        .classList.add('active'); // adicionar a classe 'active' no modal remove
    },
    close(){
        document.querySelector('.modal-overlay-remove')
        .classList.remove('active'); // remove a classe 'active' no modal remove
    }
}

//Função para confirmar a exclusão do registro da data-table
const ConfirmarRemove = {

    delete() {
        Transaction.remove();
        ModalRemove.close();
    }
    
}

// Armazenamento dos dados no local storage do navegador
const Storage = {
    get(){
        // "JSON.parse(localStorage.getItem("dev.finances:transactions"))" converte o string array novamente.
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },

    set(transactions){
        // "dev.finances:transactions" é a chave para o local storage armazenar e "JSON.stringify(transactions)" faz a conversão do array em string parar armazenar
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    }
}


const Transaction = {
    all: Storage.get(),

    //adiciona o lançamento na tabela
    add(transaction){
        Transaction.all.push(transaction);

        App.reload();
    },

    //remove o lançamento da tabela
    remove(index){
        Transaction.all.splice(index, 1);

        App.reload();
    },

    incomes() {
        //Soma as entradas
        let income = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.type == "Receita") {
                income = income + transaction.amount;
            }
        });

        return income;

    },
    
    expenses() {
        //soma as saidas
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.type == "Despesa") {
                expense += transaction.amount;
            }
        });

        return expense;
    },
    
    total() {
        return Transaction.incomes() - Transaction.expenses();
    }

}

// Criando a estrutura html do 'tr' e 'td' da tabela
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),


    addTransaction(transaction, index) {

        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr);
    },
    innerHTMLTransaction(transaction, index) {
        //colocando a classe css conforme o tipo entrada ou saida
        const CSSClass = transaction.type == "Receita" ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount);



        const html = `
        <tr>
            <td class="description">${transaction.description}</td>
            <td class="type">${transaction.type}</td>
            <td class="${CSSClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td class="actions">
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
                <img onclick="ModalRemove.open()" src="./assets/minus.svg" alt="Remover transação">
            </td>
         </tr>
        `

        return html;
    },

    //atualiza os valores dos cards "entradas", "saidas" e "total"
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes());
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses());
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total());
    },

    //limpar a lista de transações
    ClearTransaction() {
        DOM.transactionsContainer.innerHTML = "";
    }
}

//função para colocar 0 R$ na frente dos valores
const Utils = {
    formatAmount(value) {
        value = Number(value) * 100; // sem remover ponto e virgula
       // value = Number(value.replace(/\,\./g, "")) * 100; // removendo ponto e virgula
        
        return value;
    },

    formatData(date) {
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },

    formatCurrency(value) {
        //colocar o sinal de '-' na frente do valores de despesas
        //const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        //return signal + value;
        return value;
    }
    
}

// pegar os dados do formulario
const Form = {
    description: document.querySelector('input#description'),
    type: document.querySelector('select#type'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    //pega os valores dos inputs
    getValues(){
        return {
            description: Form.description.value,
            type: Form.type.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    //validar se os campos estão preenchidos
    validateFields(){
        const { description, type, amount, date } = Form.getValues();
         
        if(description.trim() === "" || type.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Preencha todos os campos");
        }
    },

    formatValues(){
        let { description, type, amount, date } = Form.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatData(date);
        
        return {
            description,
            type,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.type.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault();

        try {
            Form.validateFields()

            const transaction = Form.formatValues()

            Transaction.add(transaction)

            Form.clearFields()

            Modal.close()

            
        } catch (error) {
            alert(error.message);
        }
    }
}


// função para inicializar a aplicação
const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);

        //chamando a função para atualizar os valores dos cards
        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.ClearTransaction();
        App.init();
    },
}

App.init();



