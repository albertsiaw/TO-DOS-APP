import React, { useContext, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthContext } from '../App';
import Button from './Button';
import Input from './Input';
import Checkbox from './Checkbox';
import Label from './Label';
import Card from './Card';
import CardHeader from './CardHeader';
import CardTitle from './CardTitle';
import CardDescription from './CardDescription';
import CardContent from './CardContent';
import Dialog from './Dialog';
import DialogHeader from './DialogHeader';
import DialogTitle from './DialogTitle';
import DialogDescription from './DialogDescription';
import DialogContent from './DialogContent';
import DialogFooter from './DialogFooter';
import { queryClient } from '../App';

const GroupTodosPage = () => {
    const { user, pb } = useContext(AuthContext);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [newGroupTodoTitle, setNewGroupTodoTitle] = useState('');
    const [editingGroupTodo, setEditingGroupTodo] = useState(null);
    const [addMemberEmail, setAddMemberEmail] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [confirmDeleteTodoId, setConfirmDeleteTodoId] = useState(null);

    const { data: groups, isLoading: loadingGroups, refetch: refetchGroups } = useQuery({
        queryKey: ['groups', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const allGroups = await pb.collection('groups').getFullList();
            return allGroups.filter(group => group.members && group.members.includes(user.id));
        },
        enabled: !!user,
    });

    const { data: groupTodos, isLoading: loadingGroupTodos, refetch: refetchGroupTodos } = useQuery({
        queryKey: ['groupTodos', selectedGroup?.id],
        queryFn: async () => {
            if (!selectedGroup) return [];
            const allGroupTodos = await pb.collection('group_todos').getFullList({ group: selectedGroup.id });
            return allGroupTodos.filter(todo => todo.group === selectedGroup.id);
        },
        enabled: !!selectedGroup,
    });

    const createGroupMutation = useMutation({
        mutationFn: (name) => pb.collection('groups').create({ name, members: [user.id] }),
        onSuccess: () => {
            setNewGroupName('');
            setDialogOpen(false);
            refetchGroups();
        },
    });

    const addMemberMutation = useMutation({
        mutationFn: async ({ groupId, memberEmail }) => {
            // Find user by email using PocketBase
            const users = await pb.collection('users').getFullList({ filter: `email="${memberEmail}"` });
            const memberRecord = users[0];
            if (!memberRecord) {
                throw new Error('User not found by email.');
            }
            if (!selectedGroup.members.includes(memberRecord.id)) {
                const updatedMembers = [...selectedGroup.members, memberRecord.id];
                await pb.collection('groups').update(groupId, { members: updatedMembers });
                return { groupId, updatedMembers };
            }
            return { groupId, updatedMembers: selectedGroup.members };
        },
        onSuccess: () => {
            setAddMemberEmail('');
            setDialogOpen(false);
            refetchGroups();
        },
        onError: (error) => {
            console.error("Failed to add member:", error);
        }
    });

    const createGroupTodoMutation = useMutation({
        mutationFn: (newTodo) => pb.collection('group_todos').create(newTodo),
        onSuccess: () => {
            setNewGroupTodoTitle('');
            refetchGroupTodos();
        },
    });

    const updateGroupTodoMutation = useMutation({
        mutationFn: ({ id, data }) => pb.collection('group_todos').update(id, data),
        onSuccess: () => {
            setEditingGroupTodo(null);
            refetchGroupTodos();
        },
    });

    const deleteGroupTodoMutation = useMutation({
        mutationFn: (id) => pb.collection('group_todos').delete(id),
        onSuccess: () => {
            setConfirmDeleteTodoId(null);
            refetchGroupTodos();
        },
    });

    const handleCreateGroup = (e) => {
        e.preventDefault();
        if (newGroupName.trim() && user) {
            createGroupMutation.mutate(newGroupName);
        }
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        if (addMemberEmail.trim() && selectedGroup) {
            addMemberMutation.mutate({ groupId: selectedGroup.id, memberEmail: addMemberEmail });
        }
    };

    const handleCreateGroupTodo = (e) => {
        e.preventDefault();
        if (newGroupTodoTitle.trim() && selectedGroup && user) {
            createGroupTodoMutation.mutate({
                title: newGroupTodoTitle,
                completed: false,
                group: selectedGroup.id,
                author: user.id
            });
        }
    };

    const handleUpdateGroupTodo = (todoId, newTitle, completed) => {
        // Any group member can update
        updateGroupTodoMutation.mutate({ id: todoId, data: { title: newTitle, completed, updated: new Date().toISOString() } });
    };

    const handleDeleteGroupTodo = (todoId) => {
        // Any group member can delete
        setConfirmDeleteTodoId(todoId);
    };

    const confirmDelete = () => {
        if (confirmDeleteTodoId) {
            deleteGroupTodoMutation.mutate(confirmDeleteTodoId);
        }
    };

    if (loadingGroups) return <p className="text-center text-lg mt-8">Loading groups...</p>;

    return (
        <div className="max-w-4xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Group Todos</h2>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <Card className="flex-1 p-4">
                    <CardHeader>
                        <CardTitle>Your Groups</CardTitle>
                        <CardDescription>Select a group or create a new one.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {groups.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">No groups yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {groups.map((group) => (
                                    <li key={group.id} className="flex items-center justify-between">
                                        <Button
                                            variant={selectedGroup?.id === group.id ? 'default' : 'outline'}
                                            onClick={() => setSelectedGroup(group)}
                                            className="w-full justify-start"
                                        >
                                            {group.name}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Button className="w-full mt-4" onClick={() => { setDialogType('createGroup'); setDialogOpen(true); }}>
                            Create New Group
                        </Button>
                    </CardContent>
                </Card>

                {selectedGroup && (
                    <Card className="flex-1 p-4">
                        <CardHeader>
                            <CardTitle>Selected Group: {selectedGroup.name}</CardTitle>
                            <CardDescription>Members: {selectedGroup.members ? selectedGroup.members.length : 0}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <h4 className="font-semibold">Group Members:</h4>
                            <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
                                {selectedGroup.members && selectedGroup.members.map((memberId, index) => (
                                    <li key={index}>User ID: {memberId}</li>
                                ))}
                            </ul>
                            <Button className="w-full mt-4" onClick={() => { setDialogType('addMember'); setDialogOpen(true); }}>
                                Add Member to Group
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {selectedGroup && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Todos for {selectedGroup.name}</h3>
                    <form onSubmit={handleCreateGroupTodo} className="flex gap-2 mb-6">
                        <Input
                            type="text"
                            placeholder="Add a new group todo..."
                            value={newGroupTodoTitle || ''}
                            onChange={(e) => setNewGroupTodoTitle(e.target.value)}
                            className="flex-grow"
                        />
                        <Button type="submit" disabled={createGroupTodoMutation.isPending}>
                            {createGroupTodoMutation.isPending ? 'Adding...' : 'Add Group Todo'}
                        </Button>
                    </form>

                    {loadingGroupTodos ? (
                        <p className="text-center text-lg">Loading group todos...</p>
                    ) : groupTodos.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">No todos for this group yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {groupTodos.map((todo) => (
                                <li key={todo.id} className="flex items-center justify-between p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                                    <div className="flex items-center flex-grow">
                                        <Checkbox
                                            id={`group-todo-${todo.id}`}
                                            checked={todo.completed}
                                            onCheckedChange={(checked) => handleUpdateGroupTodo(todo.id, todo.title, checked)}
                                            className="mr-3"
                                        />
                                        <Label
                                            htmlFor={`group-todo-${todo.id}`}
                                            className={`flex-grow cursor-pointer text-lg font-bold ${todo.completed ? 'line-through text-gray-400' : 'text-blue-700 dark:text-blue-300'}`}
                                            onClick={() => handleUpdateGroupTodo(todo.id, todo.title, !todo.completed)}
                                        >
                                            {editingGroupTodo?.id === todo.id ? (
                                                <Input
                                                    value={editingGroupTodo.title || ''}
                                                    onChange={(e) => setEditingGroupTodo({ ...editingGroupTodo, title: e.target.value })}
                                                    onBlur={() => handleUpdateGroupTodo(todo.id, editingGroupTodo.title, editingGroupTodo.completed)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUpdateGroupTodo(todo.id, editingGroupTodo.title, editingGroupTodo.completed);
                                                        }
                                                    }}
                                                    className="flex-grow mr-2"
                                                />
                                            ) : (
                                                todo.title
                                            )}
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600 dark:text-gray-400 mr-2">
                                            {todo.author?.username || todo.author?.email || 'Unknown'}
                                        </span>
                                        {editingGroupTodo?.id !== todo.id && (
                                            <Button variant="outline" size="sm" onClick={() => setEditingGroupTodo(todo)}>Edit</Button>
                                        )}
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteGroupTodo(todo.id)}>Delete</Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <Dialog open={dialogOpen && dialogType === 'createGroup'} onOpenChange={setDialogOpen}>
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription>Enter a name for your new group.</DialogDescription>
                </DialogHeader>
                <DialogContent>
                    <Input
                        type="text"
                        placeholder="Group Name"
                        value={newGroupName || ''}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="mb-4"
                    />
                </DialogContent>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateGroup} disabled={createGroupMutation.isPending}>
                        {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                    </Button>
                </DialogFooter>
            </Dialog>

            <Dialog open={dialogOpen && dialogType === 'addMember'} onOpenChange={setDialogOpen}>
                <DialogHeader>
                    <DialogTitle>Add Member to {selectedGroup?.name}</DialogTitle>
                    <DialogDescription>Enter the email of the user to add to this group.</DialogDescription>
                </DialogHeader>
                <DialogContent>
                    <Input
                        type="email"
                        placeholder="member@example.com"
                        value={addMemberEmail || ''}
                        onChange={(e) => setAddMemberEmail(e.target.value)}
                        className="mb-4"
                    />
                </DialogContent>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddMember} disabled={addMemberMutation.isPending}>
                        {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                    </Button>
                </DialogFooter>
            </Dialog>

            <Dialog open={!!confirmDeleteTodoId} onOpenChange={() => setConfirmDeleteTodoId(null)}>
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this group todo? This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmDeleteTodoId(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmDelete} disabled={deleteGroupTodoMutation.isPending}>
                        {deleteGroupTodoMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default GroupTodosPage;
