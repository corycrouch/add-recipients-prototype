'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, X, Plus, Check, Trash2, MailQuestion, Settings2, ExternalLink, AlertCircle, Copy, ClipboardCheck, Info, SendHorizontal, CornerDownLeft, Database, ToggleRight, ToggleLeft, AtSign } from 'lucide-react';

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [backupData, setBackupData] = useState(null); 
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isSyncedMode, setIsSyncedMode] = useState(false); // Testing toggle
  const [showDropdown, setShowDropdown] = useState(false);
  
  const inputRef = useRef(null);
  const popoverRef = useRef(null);
  const firstNameRef = useRef(null);
  const textAreaRef = useRef(null);
  const dropdownRef = useRef(null);

  // --- Mock Directory for Synced Mode ---
  const syncedDirectory = [
    { email: "michael.jackson@music.com", firstName: "Michael", lastName: "Jackson", jobTitle: "Lead Vocalist" },
    { email: "jane.doe@enterprise.com", firstName: "Jane", lastName: "Doe", jobTitle: "Product Manager" },
    { email: "sarah.j.parker@hbo.com", firstName: "Sarah", lastName: "Parker", jobTitle: "Creative Director" },
    { email: "cory@startup.io", firstName: "Cory", lastName: "Simmons", jobTitle: "Founder" },
    { email: "ajones@agency.net", firstName: "Alex", lastName: "Jones", jobTitle: "Designer" },
    { email: "bob.bebberson@test.com", firstName: "Bob", lastName: "Bebberson", jobTitle: "Quality Assurance" }
  ];

  // Filtered results based on input
  const searchResults = isSyncedMode && inputValue.trim() 
    ? syncedDirectory.filter(contact => 
        contact.firstName.toLowerCase().includes(inputValue.toLowerCase()) || 
        contact.lastName.toLowerCase().includes(inputValue.toLowerCase()) ||
        contact.email.toLowerCase().includes(inputValue.toLowerCase())
      ).filter(contact => !recipients.find(r => r.email === contact.email))
    : [];

  // --- Testing Data for Toolbox ---
  const testEmails = [
    { email: "jane.doe@enterprise.com", label: "First.Last" },
    { email: "sarah.j.parker@hbo.com", label: "Two Periods" },
    { email: "cory@startup.io", label: "No Period (Synced Name)" },
    { email: "incomplete.entry", label: "Invalid/Incomplete" }
  ];

  const copyToClipboard = (text, id) => {
    if (textAreaRef.current) {
      textAreaRef.current.value = text;
      textAreaRef.current.select();
      try {
        document.execCommand('copy');
        setCopyFeedback(id);
        setTimeout(() => setCopyFeedback(null), 2000);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
    }
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim());

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const addRecipient = (contact, manual = false) => {
    const isEmail = manual ? isValidEmail(contact.email) : true;
    let firstName = contact.firstName || '';
    let lastName = contact.lastName || '';
    let jobTitle = contact.jobTitle || '';

    if (manual && isEmail && !firstName) {
      const [localPart] = contact.email.split('@');
      const nameParts = localPart.split('.');
      if (nameParts.length === 2) {
        firstName = capitalize(nameParts[0]);
        lastName = capitalize(nameParts[1]);
      } else if (nameParts.length >= 3) {
        firstName = capitalize(nameParts[0]);
        lastName = capitalize(nameParts[nameParts.length - 1]);
      }
    }

    const newRecipient = {
      email: contact.email,
      firstName,
      lastName,
      jobTitle,
      isInvalid: manual && !isEmail,
      isSynced: !manual || (isSyncedMode && syncedDirectory.find(d => d.email === contact.email)),
      id: Math.random().toString(36).substr(2, 9)
    };

    const updatedList = [...recipients, newRecipient];
    setRecipients(updatedList);

    if (manual && (newRecipient.isInvalid || !newRecipient.firstName)) {
      startEditing(updatedList.length - 1, updatedList);
    }

    setInputValue('');
    setShowDropdown(false);
  };

  const processInput = (text) => {
    const rawItems = text.split(/[,\s\n]+/).filter(i => i.trim() !== "");
    
    rawItems.forEach(item => {
      const textVal = item.trim();
      if (recipients.find(r => r.email === textVal)) return;
      
      const directMatch = isSyncedMode ? syncedDirectory.find(d => d.email.toLowerCase() === textVal.toLowerCase()) : null;
      
      if (directMatch) {
        addRecipient(directMatch, false);
      } else {
        addRecipient({ email: textVal }, true);
      }
    });
    setInputValue('');
  };

  const startEditing = (idx, currentList = recipients) => {
    setEditingIndex(idx);
    setBackupData({ ...currentList[idx] });
  };

  const cancelAndRevert = () => {
    if (editingIndex !== null && backupData) {
      const newList = [...recipients];
      newList[editingIndex] = { ...backupData };
      setRecipients(newList);
    }
    setEditingIndex(null);
    setBackupData(null);
  };

  const handleKeyDown = (e) => {
    // If synced dropdown is open, Enter picks the top highlighted item
    if (e.key === 'Enter' && showDropdown && isSyncedMode && inputValue.trim()) {
        e.preventDefault();
        if (searchResults.length > 0) {
            addRecipient(searchResults[0], false);
        } else {
            processInput(inputValue);
        }
        return;
    }

    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      if (inputValue.trim()) {
        e.preventDefault();
        processInput(inputValue);
      }
    }
  };

  const handlePopoverKeyDown = (e) => {
    if (e.key === 'Enter') {
      const current = recipients[editingIndex];
      if (isValidEmail(current?.email)) {
        e.preventDefault();
        setEditingIndex(null);
        setBackupData(null);
        inputRef.current?.focus();
      } else {
        triggerShake();
      }
    } else if (e.key === 'Escape') {
      cancelAndRevert();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    processInput(pastedData);
  };

  useEffect(() => {
    if (editingIndex !== null && firstNameRef.current) {
      firstNameRef.current.select();
    }
  }, [editingIndex]);

  const removeRecipient = (index) => {
    const newList = [...recipients];
    newList.splice(index, 1);
    setRecipients(newList);
    if (editingIndex === index) {
        setEditingIndex(null);
        setBackupData(null);
    }
  };

  const updateRecipient = (index, field, value) => {
    const newList = [...recipients];
    newList[index][field] = String(value);
    if (field === 'email') {
      newList[index].isInvalid = !isValidEmail(value);
      newList[index].isSynced = false;
    }
    setRecipients(newList);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setEditingIndex(null);
        setBackupData(null);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingIndex, recipients]);

  return (
    <div className="min-h-screen bg-stone-50 p-8 font-sans transition-colors duration-500 text-stone-900">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .shake-animation {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-stone-900 font-sans tracking-tight">Recipient input Proof of Concept</h1>
            <p className="text-sm text-stone-500 italic">Illustrates interactions, NOT visuals</p>
          </div>

          {/* TESTING TOGGLE */}
          <div className="flex items-center gap-3 bg-white border border-stone-200 px-4 py-2 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <Mail size={16} className={isSyncedMode ? 'text-blue-500' : 'text-stone-400'} />
              <span className="text-xs font-black uppercase tracking-wider text-stone-600">Simulate Synced Mode</span>
            </div>
            <button 
              onClick={() => {
                setIsSyncedMode(!isSyncedMode);
                setShowDropdown(false);
              }}
              className="text-stone-400 hover:text-stone-900 transition-colors"
            >
              {isSyncedMode ? (
                <ToggleRight size={32} className="text-blue-500" />
              ) : (
                <ToggleLeft size={32} className="text-stone-300" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-3 items-start">
            <div className="flex-1 relative w-full">
              <div 
                className={`min-h-[56px] w-full bg-white border-2 rounded-xl px-3 py-2 flex flex-wrap items-center gap-2 transition-all cursor-text relative
                  ${editingIndex !== null ? 'border-orange-200 shadow-md ring-4 ring-orange-50/50' : 'border-stone-200 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-50/50'}`}
                onClick={() => inputRef.current?.focus()}
              >
                {/* Recipient Chips */}
                {recipients.map((r, idx) => (
                  <div key={r.id} className="relative inline-block h-8">
                    <div 
                      onClick={(e) => { e.stopPropagation(); startEditing(idx); }}
                      className={`flex items-center gap-2 px-3 h-full rounded-full text-sm transition-all group cursor-pointer border-2
                        ${r.isInvalid 
                          ? editingIndex === idx 
                            ? 'bg-red-50 text-red-900 border-red-500 border-dotted shadow-sm ring-2 ring-red-100'
                            : 'bg-red-50 text-red-700 border-red-400 border-dotted'
                          : editingIndex === idx 
                            ? 'bg-orange-100 text-orange-900 border-orange-400 ring-1 ring-orange-400' 
                            : 'bg-stone-200 text-stone-900 border-stone-300 hover:bg-stone-300'}
                      `}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold uppercase shadow-sm relative
                        ${r.isInvalid ? 'bg-red-100 text-red-700' : 'bg-white text-stone-900'}`}>
                        {r.isInvalid ? <AlertCircle size={11} strokeWidth={3} /> : (r.firstName ? r.firstName[0] : (r.email[0]))}
                      </div>
                      <span className="max-w-[180px] truncate font-bold tracking-tight">
                        {r.firstName ? `${r.firstName} ${r.lastName}` : r.email}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeRecipient(idx); }}
                        className={`hover:text-red-600 transition-colors ml-0.5 
                          ${r.isInvalid ? 'text-red-400' : 'text-stone-500 hover:text-red-500'}`}
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </div>

                    {editingIndex === idx && (
                      <div 
                        ref={popoverRef}
                        className={`absolute top-full left-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border-2 border-stone-200 z-50 origin-top
                          ${isShaking ? 'shake-animation' : 'animate-in fade-in zoom-in duration-200'}
                        `}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm text-stone-900">Edit Contact</h3>
                            <button 
                              onClick={() => {
                                setEditingIndex(null);
                                setBackupData(null);
                              }} 
                              className="text-stone-300 hover:text-stone-900 p-1.5 rounded-md transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">First Name</label>
                              <input 
                                ref={firstNameRef}
                                type="text" 
                                value={r.firstName}
                                onChange={(e) => updateRecipient(idx, 'firstName', e.target.value)}
                                onKeyDown={handlePopoverKeyDown}
                                className="w-full px-3 py-2 bg-stone-50 border-2 border-stone-100 rounded-lg text-sm text-stone-900 font-bold focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Last Name</label>
                              <input 
                                type="text" 
                                value={r.lastName}
                                onChange={(e) => updateRecipient(idx, 'lastName', e.target.value)}
                                onKeyDown={handlePopoverKeyDown}
                                className="w-full px-3 py-2 bg-stone-50 border-2 border-stone-100 rounded-lg text-sm text-stone-900 font-bold focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Job Title</label>
                            <input 
                              type="text" 
                              value={r.jobTitle}
                              onChange={(e) => updateRecipient(idx, 'jobTitle', e.target.value)}
                              onKeyDown={handlePopoverKeyDown}
                              className="w-full px-3 py-2 bg-stone-50 border-2 border-stone-100 rounded-lg text-sm text-stone-900 font-bold focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                              Email Address <span className="text-orange-600">*</span>
                            </label>
                            <input 
                              type="email" 
                              value={r.email}
                              onChange={(e) => updateRecipient(idx, 'email', e.target.value)}
                              onKeyDown={handlePopoverKeyDown}
                              className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm font-bold focus:outline-none transition-all
                                ${r.isInvalid 
                                  ? 'border-red-400 bg-red-50 text-red-900' 
                                  : 'bg-white border-stone-200 text-stone-900 focus:border-orange-400'}`}
                            />
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                            <button 
                                onClick={cancelAndRevert}
                                className="px-3 py-2 text-stone-400 hover:text-stone-800 text-sm font-bold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                disabled={r.isInvalid}
                                onClick={() => { setEditingIndex(null); setBackupData(null); inputRef.current?.focus(); }}
                                className={`px-5 py-2 rounded-xl text-sm font-black transition-all active:scale-95 flex items-center gap-2
                                    ${!r.isInvalid 
                                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-100' 
                                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                            >
                                <span>Save</span>
                                <span className={`flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded border transition-all
                                    ${!r.isInvalid 
                                        ? 'opacity-70 bg-black/10 border-white/10' 
                                        : 'opacity-40 bg-stone-300/50 border-stone-400/20'}`}>
                                    Press <CornerDownLeft size={10} strokeWidth={4} />
                                </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Text Input Area */}
                <div className="flex-1 relative min-w-[240px]">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setShowDropdown(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={recipients.length === 0 ? "Paste emails separated by commas or spaces..." : "Add another email..."}
                    className="w-full outline-none text-sm text-stone-900 font-bold bg-transparent h-8 py-0 leading-none"
                  />
                </div>

                {/* FULL WIDTH SYNCED DROPDOWN */}
                {showDropdown && isSyncedMode && inputValue.trim() && (
                  <div 
                    ref={dropdownRef}
                    className="absolute top-full left-0 mt-3 w-full bg-white rounded-2xl shadow-2xl border-2 border-stone-200 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="max-h-[300px] overflow-y-auto">
                      {searchResults.map((contact, i) => (
                        <button
                          key={i}
                          onClick={() => addRecipient(contact, false)}
                          className={`w-full flex items-center gap-3 p-3 transition-colors border-b border-stone-100 text-left group
                            ${i === 0 ? 'bg-stone-50 ring-inset ring-2 ring-orange-100' : 'hover:bg-stone-50'}`}
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors
                            ${i === 0 ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700 group-hover:bg-purple-200'}`}>
                            {contact.firstName[0]}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold transition-colors ${i === 0 ? 'text-orange-600' : 'text-stone-900 group-hover:text-orange-600'}`}>
                                {contact.firstName} {contact.lastName}
                                </span>
                                {i === 0 && <span className="text-[8px] font-black bg-orange-200 text-orange-800 px-1 rounded">ENTER</span>}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium">
                              <span>{contact.jobTitle}</span>
                              <span className="w-1 h-1 bg-stone-200 rounded-full"></span>
                              <span>{contact.email}</span>
                            </div>
                          </div>
                        </button>
                      ))}

                      <button
                        onClick={() => processInput(inputValue)}
                        className={`w-full flex items-center gap-3 p-3 transition-colors text-left group
                          ${searchResults.length === 0 ? 'bg-stone-50 ring-inset ring-2 ring-orange-100' : 'hover:bg-stone-50'}`}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors
                          ${searchResults.length === 0 ? 'bg-orange-100 text-orange-600' : 'bg-stone-100 text-stone-500 group-hover:bg-orange-100 group-hover:text-orange-600'}`}>
                          <AtSign size={16} />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold transition-colors ${searchResults.length === 0 ? 'text-orange-600' : 'text-stone-600 group-hover:text-stone-900'}`}>
                                    Type an email to add a new person
                                </span>
                                {searchResults.length === 0 && <span className="text-[8px] font-black bg-orange-200 text-orange-800 px-1 rounded">ENTER</span>}
                            </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {inputValue && (inputValue.trim()) && !showDropdown && (
                  <button 
                    onClick={() => processInput(inputValue)}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-black hover:bg-orange-200 transition-colors"
                  >
                    QUICK ADD
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Testing Toolbox --- */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-sm max-w-2xl mx-auto opacity-60 hover:opacity-100 transition-opacity">
          <div className="bg-stone-50 px-5 py-3 border-b-2 border-stone-200 flex justify-between items-center text-stone-400">
            <h2 className="text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2">
              <Settings2 size={14} /> Dev Testing Tools
            </h2>
            <button 
              onClick={() => copyToClipboard(testEmails.map(t => t.email).join(', '), 'all')}
              className="text-[10px] font-black hover:text-orange-600 hover:bg-orange-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
            >
              {copyFeedback === 'all' ? <ClipboardCheck size={12} /> : <Copy size={12} />}
              COPY ALL
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {testEmails.map((test, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 group">
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-[9px] font-black text-stone-300 uppercase tracking-tighter">{test.label}</p>
                  <p className="text-xs font-mono text-stone-600 truncate">{test.email}</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(test.email, i)}
                  className="p-1.5 hover:bg-white rounded-md border border-transparent hover:border-stone-200 text-stone-300 hover:text-orange-600 transition-all ml-2"
                >
                  {copyFeedback === i ? <ClipboardCheck size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        <textarea ref={textAreaRef} className="absolute opacity-0 pointer-events-none" />

      </div>
    </div>
  );
};

export default App;
