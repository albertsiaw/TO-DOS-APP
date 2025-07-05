import React, { useContext, useState, useEffect } from 'react';
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
import DialogContent from './DialogContent';
import DialogFooter from './DialogFooter';
import { queryClient } from '../App';

const PublicTodosPage = () => {
    const { user, pb } = useContext(AuthContext);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [editingTodo, setEditingTodo] = useState(null);
    const [realtimeUpdates, setRealtimeUpdates] = useState([]);
    const [confirmDeleteTodoId, setConfirmDeleteTodoId] = useState(null);

    const { data: todos, isLoading, isError, error } = useQuery({
        queryKey: ['publicTodos'],
        queryFn: async () => {
            const data = await pb.collection('public_todos').getFullList({ expand: 'author' });
            return data;
        },
    });

    // Use real-time updates from PocketBase subscription
    useEffect(() => {
        let subscription;
        let isMounted = true;
        const subscribe = async () => {
            subscription = await pb.collection('public_todos').subscribe('*', (e) => {
                console.log('Realtime update:', e);
                queryClient.invalidateQueries(['publicTodos']);
                setRealtimeUpdates(prev => [
                    `[${new Date().toLocaleTimeString()}] ${e.action === 'update' ? 'Updated' : 'Created'} by ${e.record.author?.username || 'unknown'}: "${e.record.title}"`,
                    ...prev.slice(0, 4)
                ]);
            });
        };
        subscribe();
        return () => {
            if (subscription && typeof subscription.unsubscribe === 'function') {
                subscription.unsubscribe();
            }
            isMounted = false;
        };
    }, [pb]);

    const createMutation = useMutation({
        mutationFn: (newTodo) => pb.collection('public_todos').create(newTodo),
        onSuccess: () => {
            setNewTodoTitle('');
            queryClient.invalidateQueries(['publicTodos']);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => pb.collection('public_todos').update(id, data),
        onSuccess: () => {
            setEditingTodo(null);
            queryClient.invalidateQueries(['publicTodos']);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => pb.collection('public_todos').delete(id),
        onSuccess: () => {
            setConfirmDeleteTodoId(null);
            queryClient.invalidateQueries(['publicTodos']);
        },
    });

    const handleCreateTodo = (e) => {
        e.preventDefault();
        if (newTodoTitle.trim() && user) {
            createMutation.mutate({ title: newTodoTitle, completed: false, author: user.id });
        }
    };

    const handleUpdateTodo = (todoId, newTitle, completed, authorId) => {
        // Only allow update if the current user is the author
        if (user && user.id === authorId) {
            updateMutation.mutate({ id: todoId, data: { title: newTitle, completed, edited: true, updated: new Date().toISOString() } });
        } else {
            console.warn("You can only edit your own public todos.");
        }
    };

    const handleDeleteTodo = (todoId, authorId) => {
        // Only allow delete if the current user is the author
        if (user && user.id === authorId) {
            setConfirmDeleteTodoId(todoId);
        } else {
            console.warn("You can only delete your own public todos.");
        }
    };

    const confirmDelete = () => {
        if (confirmDeleteTodoId) {
            deleteMutation.mutate(confirmDeleteTodoId);
        }
    };

    if (isLoading) return <p className="text-center text-lg mt-8">Loading public todos...</p>;
    if (isError) return <p className="text-center text-red-500 mt-8">Error: {error.message}</p>;

    return (
        <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Public Todos</h2>

            <form onSubmit={handleCreateTodo} className="flex gap-2 mb-6">
                <Input
                    type="text"
                    placeholder="Add a new public todo..."
                    value={newTodoTitle || ''}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    className="flex-grow"
                />
                <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Adding...' : 'Add Public Todo'}
                </Button>
            </form>

            <div className="mb-6 p-4 border rounded-md bg-gray-100 dark:bg-gray-700">
                <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
                {realtimeUpdates.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No real-time updates yet. New public todos or edits will appear here.</p>
                ) : (
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {realtimeUpdates.map((update, index) => (
                            <li key={index} className="truncate">{update}</li>
                        ))}
                    </ul>
                )}
            </div>

            {todos.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">No public todos yet. Be the first to create one!</p>
            ) : (
                <ul className="space-y-3">
                    {todos.map((todo) => (
                        <li key={todo.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                            <div className="flex items-center flex-grow mb-2 sm:mb-0">
                                <Checkbox
                                id={`public-todo-${todo.id}`}
                                checked={todo.completed}
                                onCheckedChange={(checked) => handleUpdateTodo(todo.id, todo.title, checked, todo.author?.id)}
                                className="mr-3"
                                />
                                {editingTodo?.id === todo.id ? (
                                    <Input
                                        value={editingTodo.title}
                                        onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                                        onBlur={() => handleUpdateTodo(todo.id, editingTodo.title, editingTodo.completed, todo.author?.id)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleUpdateTodo(todo.id, editingTodo.title, editingTodo.completed, todo.author?.id);
                                            }
                                        }}
                                        className="flex-grow mr-2"
                                    />
                                ) : (
                                    <div className="flex-grow">
                                        <Label
                                        htmlFor={`public-todo-${todo.id}`}
                                        className={`cursor-pointer text-lg font-bold ${todo.completed ? 'line-through text-gray-400' : 'text-blue-700 dark:text-blue-300'}`}
                                        onClick={() => user && user.id === todo.author?.id && handleUpdateTodo(todo.id, todo.title, !todo.completed, todo.author?.id)}
                                        >
                                        {todo.title}
                                        </Label>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                            <span>Author: {todo.author?.username || 'Unknown'}</span>
                                            {todo.edited && <span className="ml-2">(Edited)</span>}
                                            <span className="ml-2"> | Created: {new Date(todo.created).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <span className="text-xs text-gray-600 dark:text-gray-400 mr-2">
                                    {todo.author?.username || todo.author?.email || 'Unknown'}
                                </span>
                                {editingTodo?.id !== todo.id && user && user.id === todo.author?.id && (
                                    <Button variant="outline" size="sm" onClick={() => setEditingTodo({ ...todo, author: todo.author })}>Edit</Button>
                                )}
                                {user && user.id === todo.author?.id && (
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTodo(todo.id, todo.author?.id)}>Delete</Button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog open={!!confirmDeleteTodoId} onOpenChange={() => setConfirmDeleteTodoId(null)}>
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this public todo? This action cannot be undone.</DialogDescription>
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

export default PublicTodosPage;
