//modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')


//modulos internos
const fs = require('fs')
operation()

function operation() {

    inquirer.prompt ([{
        type: 'list',
        name: 'action',
        message: 'O que voce deseja fazer?',
        choices: ['Criar Conta', 'Consultar Saldo', 'Depositar', 'Sacar', 'Sair']
        }])
        .then((answer) => {
            const action = answer['action']

            if (action === 'Criar Conta') {
                createAccount()
            } else if(action === 'Depositar') {
                deposit()
            } else if(action === 'Consultar Saldo') {
                getAccountBalance()

            } else if(action === 'Sacar') {
                withdraw()
            } else if(action === 'Sair') {
                console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
                process.exit()                
            }
            
        })
        .catch((err) => console.log(err))
}

// CREATE AN ACCOUNT - CRIAR CONTA

function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso Banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))
    buildAccount()
}

function buildAccount () {

    inquirer.prompt([
        {
             name: 'accountName',
             message:"Digite um nome para sua conta:"
        }
            ]).then(answer => {
                const accountName = answer['accountName']

                console.info(accountName)

                if(!fs.existsSync('accounts')) {
                    fs.mkdirSync('accounts')
                }
                if(fs.existsSync(`accounts/${accountName}.json`)) {
                    console.log(chalk.bgRed.black('Esta conta ja existe, ecolha outro nome!')
                    )
                    buildAccount()
                    return
                }

                    fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function(err) {
                        console.log(err)
                    })

                    console.log(chalk.green('Parabéns, a sua conta foi criada com sucesso!'))
                    operation()

            }).catch(err => console.log(err))

}

// ADD AN AMOUNT TO USER ACCOUNT - ADICIONAR FUNDOS A CONTA DO USUARIO

function deposit() {

    inquirer.prompt([{

        name: 'accountName', 
        message: 'Qual o nome da sua conta?'
    }]).then((answer) => {

        const accountName = answer['accountName']
        
// VERIFY IF ACCOUNT EXISTS - VERIFICAR A EXISTENCIA DA CONTA DO USÚARIO
        if(!checkAccount(accountName)) {
            return deposit()
        } 

        inquirer.prompt([{

            name:'amount',
            message:'Quanto você deseja depositar?'

        }]).then((answer) => {

            const amount = answer ['amount']

// ADD AN AMOUNT - ADICIONAR A QUANTIDADE
            addAmount(accountName, amount)
            operation()

        }).catch(err => console.log(err))

    })
    .catch(err => console.log(err))
}

// FUNCTION TO VERIFY THE EXISTS USER ACCOUNT - FUNÇÃO PARA VERIFICAR A EXISTENCIA DA CONTA DO USÚARIO

function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Conta não encontrada, verifique se digitou corretamente!'))
        return false
    }

    return true
}

// FUNCTION ADD THE DESIRED QUANTITY TO THE USER ACCOUNT - FUNÇÃO PARA ADICIONAR A QUANTIDADE DESEJADA NA CONTA DO USÚARIO

function addAmount(accountName, amount) {
 const accountData = getAccount (accountName)
 if(!amount) {
     console.log(chalk.bgRed.black('Ocorreu um erro.tente novamente mais tarde'))
     return deposit()
 }

 accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

 fs.writeFileSync(
     `accounts/${accountName}.json`,
     JSON.stringify(accountData),
     function (err) {
         console.log(err)
     }
 )
     console.log(chalk.green(`Foi depositado o valor de R$${amount} em sua conta!`))
     
}

// FUNCTION TO FIND THE USER ACCOUNT - FUNÇÃO PARA LOCALIZAR A CONTA DO USÚARIO

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}
// SHOW ACCOUNT BALANCE - MOSTAR SALDO DA CONTA
    function getAccountBalance() {
        inquirer.prompt([
            { 
                name:'accountName',
                message:'Qual o nome da sua conta?'
            
        }]).then((answer) => {
        
        const accountName = answer['accountName']

// VERIFY EXISTS ACCOUNT - VERIFICAR SE A CONTA EXISTE
        if(!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(
            `Olá seu saldo da sua conta é R$${accountData.balance}`
        ))
        operation()
        }).catch(err => console.log(err))
    }

// WITHDRAW THE AMOUNT FROM THE USER'S ACCOUNT - SACAR A QUANTIA DA CONTA DO USUARIO
    function withdraw() {
        inquirer.prompt([
            {
                name: 'accountName',
                message: 'Qual o nome da sua conta?'
            }
        ]).then((answer) => {
            const accountName = answer['accountName']

            if(!checkAccount(accountName)) {
                return withdraw()
            }

            inquirer.prompt ([
                {
                    name: 'amount',
                    message: 'Quanto você deseja sacar?'
                }
            ]).then((answer) =>{

                const amount = answer['amount']

                removeAmount(accountName, amount)
                

            })
            .catch(err => console.log(err))

        }).catch(err => console.log(err))
    }

    function removeAmount(accountName, amount) {
        const accountData = getAccount(accountName)

        if(!amount) {

            console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
            return withdraw()
        }

        if(accountData.balance < amount){
            console.log(chalk.bgRed.black('Valor indisponivel!'))
            return withdraw()
        }
        accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

        fs.writeFileSync(
            `accounts/${accountName}.json`,
            JSON.stringify(accountData),
            function (err) {
                console.log(err)
            }
        )
        console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`))
        operation()
    }