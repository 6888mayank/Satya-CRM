'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { formatDate } from '@/lib/utils';
import { CheckSquare, Plus, CheckCircle2, Clock, X } from 'lucide-react';
import { Task } from '@/types/crm';

export default function TasksView() {
  const { tasks, currentUser } = useCRM();
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState(currentUser.name);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('High');

  const toggleTaskStatus = (id: string) => {
    setTaskList(
      taskList.map((t) =>
        t.id === id ? { ...t, status: t.status === 'Done' ? 'In Progress' : 'Done' } : t
      )
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title,
      assignedTo,
      dueDate,
      priority,
      status: 'To Do'
    };
    setTaskList([newTask, ...taskList]);
    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Action Items & Tasks</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            DPR preparation, document verification, bank submissions, and IT sprint tasks
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['To Do', 'In Progress', 'Done'] as const).map((col) => {
          const colTasks = taskList.filter((t) => t.status === col);
          return (
            <div
              key={col}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {col}
                </h4>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {colTasks.length}
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                {colTasks.length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-6 text-center">No tasks</p>
                ) : (
                  colTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => toggleTaskStatus(t.id)}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-800 transition"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs font-semibold ${t.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {t.title}
                        </p>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                            t.priority === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : t.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        <span>Assigned: {t.assignedTo}</span>
                        <span>Due: {formatDate(t.dueDate)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Create New Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upload PMEGP DPR to Bank portal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Assigned Rep</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-700"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
