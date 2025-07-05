import React, { useContext, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthContext } from '../App';
import Button from './Button';
import Input from './Input';
import Checkbox from './Checkbox';
import Label from './Label';
import Dialog from './Dialog';
import DialogHeader from './DialogHeader';
import DialogTitle from './DialogTitle';
import DialogDescription from './DialogDescription';
import DialogFooter from './DialogFooter';
import { queryClient } from '../App';

const PrivateTodosPage = () => {
    const { user, pb } = useContext(AuthContext);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [editingTodo, setEditingTodo] = useState(null);
    const [confirmDeleteTodoId, setConfirmDeleteTodoId] = useState(null);

    const { data: todos, isLoading, isError, error } = useQuery({
        queryKey: ['privateTodos', user?.id],
        queryFn: async () => {
            if (!user) return [];
            // Only fetch todos belonging to the logged-in user
            const data = await pb.collection('private_todos').getFullList({ filter: `user="${user.id}"` });
            return data;
        },
        enabled: !!user,
    });

    const createMutation = useMutation({
        mutationFn: (newTodo) => pb.collection('private_todos').create(newTodo),
        onSuccess: () => {
            setNewTodoTitle('');
            queryClient.invalidateQueries(['privateTodos', user.id]);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => pb.collection('private_todos').update(id, data),
        onSuccess: () => {
            setEditingTodo(null);
            queryClient.invalidateQueries(['privateTodos', user.id]);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => pb.collection('private_todos').delete(id),
        onSuccess: () => {
            setConfirmDeleteTodoId(null);
            queryClient.invalidateQueries(['privateTodos', user.id]);
        },
    });

    const handleCreateTodo = (e) => {
        e.preventDefault();
        if (newTodoTitle.trim() && user) {
            createMutation.mutate({ title: newTodoTitle, completed: false, user: user.id });
        }
    };

    const handleUpdateTodo = (id, newTitle, completed) => {
        updateMutation.mutate({ id, data: { title: newTitle, completed, updated: new Date().toISOString() } });
    };

    const handleDeleteTodo = (id) => {
        setConfirmDeleteTodoId(id);
    };

    const confirmDelete = () => {
        if (confirmDeleteTodoId) {
            deleteMutation.mutate(confirmDeleteTodoId);
        }
    };

    if (isLoading) return <p className="text-center text-lg mt-8">Loading private todos...</p>;
    if (isError) return <p className="text-center text-red-500 mt-8">Error: {error.message}</p>;

    return (
        <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Your Private Todos</h2>
            <form onSubmit={handleCreateTodo} className="flex gap-2 mb-6">
                <Input
                    type="text"
                    placeholder="Add a new private todo..."
                    value={newTodoTitle || ''}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    className="flex-grow"
                />
                <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Adding...' : 'Add Todo'}
                </Button>
            </form>

            {todos.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">No private todos yet. Add one above!</p>
            ) : (
                <ul className="space-y-3">
                    {todos.map((todo) => (
                        <li key={todo.id} className="flex items-center justify-between p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                            <div className="flex items-center flex-grow">
                                <Checkbox
                                    id={`todo-${todo.id}`}
                                    checked={todo.completed}
                                    onCheckedChange={(checked) => handleUpdateTodo(todo.id, todo.title, checked)}
                                    className="mr-3"
                                />
                                <Label
                                    htmlFor={`todo-${todo.id}`}
                                    className={`flex-grow cursor-pointer text-lg font-bold ${todo.completed ? 'line-through text-gray-400' : 'text-blue-700 dark:text-blue-300'}`}
                                    onClick={() => handleUpdateTodo(todo.id, todo.title, !todo.completed)}
                                >
                                    <span className="flex-grow text-lg font-bold mr-2">
                                        {todo.title}
                                    </span>
                                    {editingTodo?.id === todo.id && (
                                        <Input
                                            value={editingTodo.title || ''}
                                            onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                                            onBlur={() => handleUpdateTodo(todo.id, editingTodo.title, editingTodo.completed)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleUpdateTodo(todo.id, editingTodo.title, editingTodo.completed);
                                                }
                                            }}
                                            className="flex-grow mr-2"
                                        />
                                    )}
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-base text-gray-900 dark:text-gray-100 mr-2 font-medium">
                                    {todo.title}
                                </span>
                                {editingTodo?.id !== todo.id && todo.user === user.id && (
                                    <Button variant="outline" size="sm" onClick={() => setEditingTodo(todo)}>Edit</Button>
                                )}
                                {todo.user === user.id && (
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTodo(todo.id)}>Delete</Button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog open={!!confirmDeleteTodoId} onOpenChange={() => setConfirmDeleteTodoId(null)}>
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this private todo? This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmDeleteTodoId(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default PrivateTodosPage;
