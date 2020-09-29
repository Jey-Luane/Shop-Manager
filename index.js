const { connect } = require("mongoose");
const { shop } = require(`./schemas.js`);

const cls = () => process.stdout.write("\x1B[2J\x1B[0f");

connect("mongodb://localhost:27017/youdbrepository", { useNewUrlParser: true })
    .then(() => {
        cls();
        console.log(`DB Repository`);
        askAction();
    })
    .catch(() => {
        connect("mongodb://youcredential:27704/youdbrepository", { useNewUrlParser: true })
            .then(() => {
                cls();
                console.log(`DB Repository`)
                askAction();
            })
            .catch(console.error);
    });

const { createInterface } = require('readline');

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

function askAction() {
    rl.question('Choice one: [ change || remove || add ]\n', answer => {
        cls();
        switch (answer) {
            case "change":
                (function alterar() {
                    cls();
                    rl.question(`Do you want to change which item? Enter the item ID:`, answer => {
                        shop.findById("shop").then(loja => {
                            let itemIndex = loja.items.findIndex(i => i._id === answer);
                            if (itemIndex < 0) {
                                console.log(`\nInvalid ID\n`);
                                cls();
                                alterar();
                            } else {
                                alterarItem(loja.items[itemIndex], loja);
                            }
                        })
                        .catch(console.error)
                    });
                })();
                break;
            case "remove":
                (function remover() {
                    rl.question(`Which item do you want to remove? Enter the item ID: `, answer => {
                        shop.findById("shop").then(loja => {
                            let itemIndex = loja.items.findIndex(i => i._id === answer);
                            if (itemIndex < 0) {
                                console.log(`\nInvalid ID\n`);
                                cls();
                                remover();
                            } else {
                                removerItem(itemIndex, loja);
                            }
                        })
                        .catch(console.error)
                    });
                })();
                break;
            case "add":
                shop.findById("shop")
                    .then(adicionarItem)
                    .catch(console.error);
                break;
            default:
                askAction();
        }
    });
}

function alterarItem(item, loja) {
    cls();
    console.log(`You have selected the item ${item}`);
    rl.question(`Enter the new name or just enter\n`, answer => {
        if (answer) item.name = answer;
        question2();
    });
    function question2() {
        rl.question(`\nEnter the new quantity or just enter\n`, answer => {
            if (answer) {
                if (isNaN(Number(answer))) {
                    console.log(`Please enter a valid number`);
                    return question2();
                }
                item.quantity = answer;
            }
            question3();
        });
    }
    function question3() {
        rl.question(`\nEnter the new price or just enter\n`, answer => {
            if (answer) {
                if (isNaN(Number(answer))) {
                    console.log(`Please enter a valid number`);
                    return question3();
                }
                item.price = answer;
            }
            check();
        });
    }
    function check() {
        cls();
        rl.question(`\nNew Item: ${item}\nDo you want to save your changes? (y/n)`, answer => {
            switch (answer[0]) {
                case "y":
                    saveDB(loja);
                    break;
                case "n":
                    console.log(`Ending process.`);
                    process.exit(0);
                    break;
                default:
                    check();
            }
        });
    }
}

function removerItem(index, loja) {
    let removed = loja.items.splice(index, 1);
    (function check() {
        rl.question(`Item removed: ${removed}\nDo you want to save your changes? (y/n) `, answer => {
            switch (answer[0]) {
                case "y":
                    saveDB(loja);
                    break;
                case "n":
                    console.log(`Ending process.`);
                    process.exit(0);
                    break;
                default:
                    check();
            }
        });
    })();
}

function adicionarItem(loja) {
    let newItem = {};
    (function getID() {
        rl.question(`Enter the id of the new item: `, answer => {
            if (!answer || / /.test(answer) || /[^a-z]/.test(answer)) {
                console.log(`The id must contain only characters from 'a' to 'z'`);
                getID();
            } else {
                newItem._id = answer;
                getName();
            }
        });
    })();
    function getName() {
        rl.question(`Enter the name of the new item: `, answer => {
            if (!answer) {
                console.log(`Please enter a valid name`);
                getName();
            } else {
                newItem.name = answer;
                getQuantity();
            }
        });
    };
    function getQuantity() {
        rl.question(`Enter the initial quantity of the new item: `, answer => {
            if (!answer || isNaN(Number(answer))) {
                console.log(`Please enter a valid number`);
                getQuantity();
            } else {
                newItem.quantity = answer;
                getPrice();
            }
        });
    }
    function getPrice() {
        rl.question(`Enter the starting price of the new item: `, answer => {
            if (!answer || isNaN(Number(answer))) {
                console.log(`Please enter a valid number`);
                getPrice();
            } else {
                newItem.price = answer;
                getIndex();
            }
        });
    }

    const { inspect } = require("util");
    
    function getIndex() {
        rl.question(`New Item: ${inspect(newItem)}\nEnter the position you want to insert the new item or enter to insert at the beginning:`, answer => {
            if (!answer) return check();
            if (isNaN(Number(answer))) {
                console.log(`Please enter a valid number`);
                getIndex();
            } else {
                check(Math.min(answer, loja.items.length));
            }
        });
    }
    function check(index = 0) {
        cls();
        loja.items.splice(index, 0, newItem);
        rl.question(`New Item: ${inspect(newItem)}\nPosition to be inserted: ${index}\nDo you want to save your changes? (y/n) `, answer => {
            switch (answer[0]) {
                case "y":
                    saveDB(loja);
                    break;
                case "n":
                    console.log(`Ending Process`);
                    process.exit(0);
                    break;
                default:
                    check();
            }
        });
    }
}

function saveDB(loja) {
    loja.save()
        .then(() => {
            console.log(`Changes saved successfully`);
            process.exit(0);
        })
        .catch(err => {
            console.log(`Error saving changes: ${err}`);
            process.exit(1);
        });
}
