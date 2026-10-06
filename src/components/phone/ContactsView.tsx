import React, { useState } from 'react';
import { Search, UserPlus, Phone, MessageSquare, Star, Trash2, X } from 'lucide-react';
import { Contact } from '../../types';

interface ContactsViewProps {
  contacts: Contact[];
  onCall: (number: string) => void;
  onSaveContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  initialAddNumber?: string;
  onClearInitialAddNumber?: () => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onCall,
  onSaveContact,
  onDeleteContact,
  initialAddNumber,
  onClearInitialAddNumber,
}) => {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(Boolean(initialAddNumber));
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // New Contact Form State
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState(initialAddNumber || '');
  const [newEmail, setNewEmail] = useState('');
  const [newLabel, setNewLabel] = useState<'Mobile' | 'Work' | 'Home'>('Mobile');

  const filteredContacts = contacts
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.number.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newNumber.trim()) return;

    const contact: Contact = {
      id: 'c_' + Date.now(),
      name: newName.trim(),
      number: newNumber.trim(),
      email: newEmail.trim() || undefined,
      label: newLabel,
      favorite: false,
    };

    onSaveContact(contact);
    setNewName('');
    setNewNumber('');
    setNewEmail('');
    setIsAddModalOpen(false);
    if (onClearInitialAddNumber) onClearInitialAddNumber();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden">
      {/* Header & Search */}
      <div className="px-5 pt-3 pb-3 border-b border-neutral-900 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white">Contacts</h1>
          <button
            onClick={() => {
              setNewNumber(initialAddNumber || '');
              setIsAddModalOpen(true);
            }}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-blue-400 flex items-center justify-center transition-colors"
            title="Add Contact"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts"
            className="w-full bg-neutral-900 text-sm text-neutral-200 placeholder:text-neutral-500 rounded-lg pl-9 pr-4 py-2 border border-neutral-850 focus:outline-none focus:border-neutral-700 transition-colors"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto px-4 divide-y divide-neutral-900/80">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-500 text-sm">
            <span>No contacts found</span>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className="py-3 flex items-center justify-between hover:bg-neutral-900/50 px-2 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-850 border border-neutral-800 flex items-center justify-center text-sm font-semibold text-neutral-300">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-neutral-100">{contact.name}</span>
                    {contact.favorite && (
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                  <span className="text-xs text-neutral-500">{contact.number}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCall(contact.number);
                }}
                className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-emerald-600 hover:text-white text-neutral-400 flex items-center justify-center transition-colors"
                title="Call"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Selected Contact Detail Sheet */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-6 text-neutral-100 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xl font-bold">
                {selectedContact.name.charAt(0)}
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xl font-bold mb-1">{selectedContact.name}</h2>
            <p className="text-sm text-neutral-400 mb-6">{selectedContact.label} · {selectedContact.number}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => {
                  onCall(selectedContact.number);
                  setSelectedContact(null);
                }}
                className="h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Call</span>
              </button>
              <button
                onClick={() => setSelectedContact(null)}
                className="h-11 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
            </div>

            <button
              onClick={() => {
                onDeleteContact(selectedContact.id);
                setSelectedContact(null);
              }}
              className="w-full py-2.5 text-xs font-medium text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Contact</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 text-neutral-100 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold">New Contact</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  if (onClearInitialAddNumber) onClearInitialAddNumber();
                }}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-neutral-850 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="w-full bg-neutral-850 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-700 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-neutral-850 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1">Label</label>
                <select
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value as 'Mobile' | 'Work' | 'Home')}
                  className="w-full bg-neutral-850 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-700"
                >
                  <option value="Mobile">Mobile</option>
                  <option value="Work">Work</option>
                  <option value="Home">Home</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 font-semibold text-xs rounded-lg hover:bg-neutral-750 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
