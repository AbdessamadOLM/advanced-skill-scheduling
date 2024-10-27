console.log("let's goooo!");

const tasks = [
  {
    taskName: "Feature A",
    difficulty: 7,
    hoursRequired: 15,
    taskType: "feature",
    priority: 4,
    dependencies: [],
  },
  {
    taskName: "Bug Fix B",
    difficulty: 5,
    hoursRequired: 10,
    taskType: "bug",
    priority: 5,
    dependencies: [],
  },
  {
    taskName: "Refactor C",
    difficulty: 9,
    hoursRequired: 25,
    taskType: "refactor",
    priority: 3,
    dependencies: ["Bug Fix B"],
  },
  {
    taskName: "Optimization D",
    difficulty: 6,
    hoursRequired: 20,
    taskType: "feature",
    priority: 2,
    dependencies: [],
  },
  {
    taskName: "Upgrade E",
    difficulty: 8,
    hoursRequired: 15,
    taskType: "feature",
    priority: 5,
    dependencies: ["Feature A"],
  },
];

const developers = [
  { name: "Alice", skillLevel: 7, maxHours: 40, preferredTaskType: "feature" },
  { name: "Bob", skillLevel: 9, maxHours: 30, preferredTaskType: "bug" },
  {
    name: "Charlie",
    skillLevel: 5,
    maxHours: 35,
    preferredTaskType: "refactor",
  },
];
// check if dependencies are assigned before assigning the main task
function isDependenteTaskAreAsigned(assignedTasks, task) {
  if (task.dependencies.length > 0) {
    for (let i in task.dependencies) {
      let dependency = task.dependencies[i];
      let isDependencyAssigned = false;
      for (let j in assignedTasks) {
        let assignedTask = assignedTasks[j];
        if (assignedTask.taskName === dependency) {
          isDependencyAssigned = true;
          break;
        }
      }
      // if one of the dependencies is not already assigned it return false
      if (!isDependencyAssigned) {
        return false;
      }
    }
  }

  // if the task have no dependencies it should return true
  return true;
}

  // this function is to check that a task is assigned
function isThisTaskAssined(assignedTasks, task) {
  for (let i in assignedTasks) {
    let assignedTask = assignedTasks[i];
    if (assignedTask.taskName === task.taskName) return true;
  }
  return false;
}


// this function is to calculate the time required to complete the previous task in dependency cases
// this is to garanty that the tasks with dependencies are only assigned after their prerequisites are complete  
function totalDependenciesTaskTime(developers, task) {

    // search for the developer who had this task's dependency so I can count the time need for
    // the dependency to be complete. this is by considering the time, and the order of this task
    // in the developer tasks
   let totalDependenciesTime = 0;
   for (let i = 0; i < task.dependencies.length; i++) {
     const dependencyName = task.dependencies[i];

     const dependencyTask = tasks.find((t) => t.taskName === dependencyName);
     if (dependencyTask) {
       for (let j = 0; j < developers.length; j++) {
         const developer = developers[j];
         const taskIndex = developer.tasks.findIndex(
           (t) => t.taskName === dependencyName
         );
         if (taskIndex !== -1) {
           for (let k = 0; k <= taskIndex; k++) {
             totalDependenciesTime += developer.tasks[k].hoursRequired;
           }
           break; 
         }
       }
     }
   }

   return totalDependenciesTime;
}

function assignTasksWithPriorityAndDependencies(developers, tasks) {
  var assignedTasks = [];
  var unassignedTasks = [];

  // Sort the tasks based on priority and difficulty
  tasks.sort((a, b) => b.priority - a.priority || a.difficulty - b.difficulty);

  // Initialase an array of developers with their assigned tasks and total work hours.
  developers.forEach((dev) => {
    dev.tasks = [];
    dev.totalHours = 0;
  });

  // At the beginning of the process all tasks are unassigned
  unassignedTasks = [...tasks];
  // Iterate over all tasks and assign them to devlopers considering there prefered task
  // the max hours they can work and dependencies
  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i];
    for (let j in developers) {
      let developer = developers[j];
      // check developer preferred task and max hours and ensure that the dependencies are assigned
      if (
        developer.preferredTaskType === task.taskType &&
        developer.totalHours + task.hoursRequired <= developer.maxHours &&
        isDependenteTaskAreAsigned(assignedTasks, task)
      ) {
        // for task with dependencies
        if (task.dependencies.length > 0) {
          // if this is the first task for this developer I have to add the time of the dependency 
          // to the total time of the developer to garanty that the dependency is completed
          if (
            developer.totalHours == 0 &&
            totalDependenciesTaskTime(developers, task) + task.hoursRequired <=
              developer.maxHours
          ) {
            assignedTasks.push(task);
            developer.tasks.push(task);
            developer.totalHours +=
              totalDependenciesTaskTime(developers, task) + task.hoursRequired;
          }
          // if this is not the first task for this developer I have to substruct the time
          //he spent in his previous tasks from the dependency time
          // to the total time of the developer to garanty that the dependency is completed
          else if (
            developer.totalHours > 0 &&
            totalDependenciesTaskTime(developers, task) -
              developer.totalHours +
              task.hoursRequired <=
              developer.maxHours
          ) {
            assignedTasks.push(task);
            developer.tasks.push(task);
            developer.totalHours +=
              task.hoursRequired +
              (totalDependenciesTaskTime(developers, task) -
                developer.totalHours);
          }
        }
          // ideal case if the task has no dependencies
        else {
          assignedTasks.push(task);
          developer.tasks.push(task);
          developer.totalHours += task.hoursRequired;
        }
      }
      // Ensures that tasks with dependencies are only assigned after their prerequisites are complete
      // Handle tasks with dependencies and high priority
      // if the task has dependencies and high priority i have to assign their dependencies
      //first then assign the main task
      else if (!isDependenteTaskAreAsigned(assignedTasks, task)) {
        for (var f = 0; f < task.dependencies.length; f++) {
          // get the task and the task index from dependency
          const auxTaskIndex = tasks.findIndex(
            (t) => t.taskName === task.dependencies[f]
          );
          const auxTask = auxTaskIndex ? tasks[auxTaskIndex] : null;
          // recheck if the task is what I'm looking for and if it's not assigned
          if (
            auxTask?.taskName === task.dependencies[f] &&
            !isThisTaskAssined(assignedTasks, auxTask)
          ) {

            // I have to find a developer to assign the task
            for (let m = 0; m < developers.length; m++) {
              if (
                developers[m].preferredTaskType === auxTask.taskType &&
                developers[m].totalHours + auxTask.hoursRequired <=
                  developers[m].maxHours
              ) {
                assignedTasks.push(auxTask);
                developers[m].tasks.push(auxTask);
                developers[m].totalHours += auxTask.hoursRequired;
                // after asigning the dependency i have to decrement the counter to reiterate
                // over the main task to respect the priority
                i = i - 1;
              }
            }
          }
        }
      }
    }
  }
  // extract unassigned tasks 
  unassignedTasks = tasks.filter((value) => !assignedTasks.includes(value));
  return {
    developers: developers,
    unassignedTasks: unassignedTasks,
  };
}

// console.log(assignTasksWithPriorityAndDependencies(developers, tasks));
output(assignTasksWithPriorityAndDependencies(developers, tasks));


// function to organize the display of developer with their tasks
function output(result = []) {
  console.log("----------------------------------------------------------------");
  console.log("|                  Developers Description                      |");
  console.log("----------------------------------------------------------------");

  result.developers.forEach((dev) => {
    console.log(`Developer: ${dev.name}`);
    console.log(`Tasks: ${JSON.stringify(dev.tasks, null, 2)}`); // Pretty print the tasks
    console.log(
      `Total Hours:                                            ${dev.totalHours}`
    );
    console.log("-----------------------------------------------------------");
  });

  console.log("----------------------------------------------------------------");
  console.log("|                        UnassignedTasks                        |");
  console.log("----------------------------------------------------------------");
  console.log(
    `Unassigned Tasks: ${JSON.stringify(result.unassignedTasks, null, 2)}`
  );
}
