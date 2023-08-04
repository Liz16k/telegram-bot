const { Markup } = require("telegraf");
const cron = require("node-cron");
const { Tasks } = require("../models/Tasks");

async function fetchUserTasks(userId) {
  try {
    let tasksDoc = await Tasks.findOne({ userId });
    if (!tasksDoc) return [];
    return tasksDoc.tasks;
  } catch (error) {
    console.error("Ошибка при получении списка задач:", error.message);
    return [];
  }
}

async function saveTaskToDB(userId, taskData) {
  try {
    const tasksDoc = await Tasks.findOne({ userId });
    if (tasksDoc !== null) {
      tasksDoc.tasks = [...tasksDoc.tasks, { ...taskData }];
      await tasksDoc.save();
    } else {
      const newTasksDoc = new Tasks({
        userId,
        tasks: [taskData],
      });
      await newTasksDoc.save();
    }
  } catch (error) {
    console.log(error.message);
  }
}
async function deleteTaskFromDB(userId, taskId) {
  try {
    const tasksDoc = await Tasks.findOne({ userId });
    const taskIndex = tasksDoc.tasks.findIndex(
      (task) => task._id.toString() === taskId
    );
    const task = tasksDoc.tasks.splice(taskIndex, 1);
    deleteTaskSheduler(task[0].shedulerId);
    await tasksDoc.save();
  } catch (error) {
    console.error("Ошибка при удалении задачи:", error.message);
    throw error;
  }
}

async function deleteTaskSheduler(shedulerId) {
  const sheduler = cron.getTasks().get(shedulerId);
  sheduler.stop();
}

async function fetchTasksListKeyboard(userId) {
  const tasks = await fetchUserTasks(userId);
  let keyboard = Markup.inlineKeyboard([
    ...tasks.map((task, i) => [
      Markup.button.callback(
        `${i + 1}. ${task.name} (${task.status}) ❌`,
        ["delete", i, userId].join("_")
      ),
    ]),
    [Markup.button.callback("Выйти", "exit")],
  ])
    .resize()
    .oneTime();
  return keyboard;
}

module.exports = {
  saveTaskToDB,
  deleteTaskFromDB,
  fetchUserTasks,
  fetchTasksListKeyboard,
  fetchUserTasks,
};