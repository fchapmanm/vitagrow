jest.mock('../services/firebaseConfig', () => ({ firestore: {} }));

import { fetchTodayReminders, Plant, Task } from '../services/plantService';

describe('fetchTodayReminders', () => {
  it('includes overdue, today, and next 3 days; excludes later and missing plants', async () => {
    const today = new Date();
    const iso = (d: Date) => new Date(d).toISOString();

    const plants: Plant[] = [
      { id: 'p1', name: 'Tomato', addedAt: iso(today), status: 'growing', plantingDate: iso(today) },
    ];

    const tYesterday = new Date(today); tYesterday.setDate(today.getDate() - 1);
    const tToday = new Date(today);
    const tPlus2 = new Date(today); tPlus2.setDate(today.getDate() + 2);
    const tPlus5 = new Date(today); tPlus5.setDate(today.getDate() + 5);

    const tasks: Task[] = [
      { id: 'a', taskName: 'Overdue', completed: false, createdAt: iso(today), dueDate: iso(tYesterday), plantId: 'p1' },
      { id: 'b', taskName: 'Today', completed: false, createdAt: iso(today), dueDate: iso(tToday), plantId: 'p1' },
      { id: 'c', taskName: 'Soon', completed: false, createdAt: iso(today), dueDate: iso(tPlus2), plantId: 'p1' },
      { id: 'd', taskName: 'Later', completed: false, createdAt: iso(today), dueDate: iso(tPlus5), plantId: 'p1' },
      { id: 'e', taskName: 'MissingPlant', completed: false, createdAt: iso(today), dueDate: iso(tToday), plantId: 'pX' },
    ];

    const result = await fetchTodayReminders(null, true, tasks, plants);
    const names = result.map(t => t.taskName).sort();

    expect(names).toContain('Overdue');
    expect(names).toContain('Today');
    expect(names).toContain('Soon');
    expect(names).not.toContain('Later');
    expect(names).not.toContain('MissingPlant');
  });
});