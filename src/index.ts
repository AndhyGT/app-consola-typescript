import inquirer from 'inquirer';
import { tasks } from './exampleData';
import { JsonTaskCollection } from './models/JsonTaskCollection';


const collection = new JsonTaskCollection('Andhy', tasks);
let showCompleted: boolean = true;


function displayTaskList(): void {
    console.log(`${collection.userName}'s Tasks` + `(${collection.getTaskCounts().incomplete} task to do)`);
    collection.getTaskItems(showCompleted).forEach(task => task.printDetails());
}

enum Commands {
    Add = 'Add New Task',
    Complete = 'Complete Task',
    Toggle = 'Show/Hide Competed',
    Purge = 'Remove Completed Tasks',
    Quit = 'Quit'
}

async function promptAdd(): Promise<void> {
    console.clear();
    const answers = await inquirer.prompt({
        type: 'input',
        name: 'add',
        message: 'Enter Task:'
    });

    if (answers['add'] !== '') {
        collection.addTask(answers['add']);
    }

    promptUser();
}

async function promptComplete(): Promise<void> {
    console.clear();
    const answers = await inquirer.prompt({
        type: 'checkbox',
        name: 'complete',
        message: 'Mark Task Complete',
        choices: collection.getTaskItems(showCompleted).map(item => ({
            name: item.task,
            value: item.id,
            checked: item.complete
        }))
    });
    let completedTasks = answers['complete'] as number[];
    collection
        .getTaskItems(true)
        .forEach(item => collection.markComplete(
            item.id,
            completedTasks.find(id => id === item.id) != undefined)
        );
    promptUser();
}

async function promptUser() {
    console.clear();
    displayTaskList();

    const answers = await inquirer.prompt({
        type: 'list',
        name: 'Command',
        message: 'Choose Option',
        choices: Object.values(Commands)
    });
    switch (answers['Command']) {
        case Commands.Toggle:
            showCompleted = !showCompleted;
            promptUser();
            break;
        case Commands.Add:
            promptAdd();
            break;
        case Commands.Complete:
            if (collection.getTaskCounts().incomplete > 0) {
                promptComplete();
            } else {
                promptUser();
            }
            break;
        case Commands.Purge:
            collection.removeComplete();
            promptUser();
            break;
    }
}

promptUser();