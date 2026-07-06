'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, AlertTriangle, AtSign, ChevronDown, Copy, ClipboardCheck } from 'lucide-react';

const SYNCED_DIRECTORY = [
  { email: "jane.doe@enterprise.com", firstName: "Jane", lastName: "Doe", jobTitle: "Product Manager" },
  { email: "michael.jackson@music.com", firstName: "Michael", lastName: "Jackson", jobTitle: "Lead Vocalist" },
  { email: "sarah.j.parker@hbo.com", firstName: "Sarah", lastName: "Parker", jobTitle: "Creative Director" },
  { email: "cory@startup.io", firstName: "Cory", lastName: "Simmons", jobTitle: "Founder" },
  { email: "ajones@agency.net", firstName: "Alex", lastName: "Jones", jobTitle: "Designer" },
  { email: "bob.bebberson@test.com", firstName: "Bob", lastName: "Bebberson", jobTitle: "Quality Assurance" },
  { email: "maria.gonzalez@retailco.com", firstName: "Maria", lastName: "Gonzalez", jobTitle: "Regional Sales Director" },
  { email: "james.okonkwo@fintech.io", firstName: "James", lastName: "Okonkwo", jobTitle: "Engineering Manager" },
  { email: "lisa.chen@healthco.com", firstName: "Lisa", lastName: "Chen", jobTitle: "Clinical Operations Lead" },
  { email: "tom.harrison@buildcorp.com", firstName: "Tom", lastName: "Harrison", jobTitle: "Project Superintendent" },
  { email: "amanda.foster@mediahub.com", firstName: "Amanda", lastName: "Foster", jobTitle: "Brand Strategist" },
  { email: "kevin.singh@logistics.io", firstName: "Kevin", lastName: "Singh", jobTitle: "Supply Chain Analyst" },
  { email: "rachel.morris@lawfirm.com", firstName: "Rachel", lastName: "Morris", jobTitle: "Associate Attorney" },
  { email: "daniel.vega@saasco.com", firstName: "Daniel", lastName: "Vega", jobTitle: "Customer Success Manager" },
  { email: "priya.sharma@consulting.group", firstName: "Priya", lastName: "Sharma", jobTitle: "Management Consultant" },
  { email: "marcus.wright@nonprofit.org", firstName: "Marcus", lastName: "Wright", jobTitle: "Development Director" },
  // Incomplete records
  { email: "nina.patel@healthco.com", firstName: "Nina", lastName: "Patel" },
  { email: "rwilliams@consulting.group", firstName: "Rachel" },
  { email: "vendor-inquiries@supplychain.io" },
  { email: "ops@logistics-partners.com" },
];

const AVATAR_COLORS = [
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-[#C3EBD8]', text: 'text-[#2F5E46]' },
  { bg: 'bg-[#FFDFCF]', text: 'text-[#8F4E30]' },
];

const DESIGN_REQUIREMENTS = [
  {
    id: 1,
    title: 'User can click to add recipient',
    steps: [
      'Click the input box',
      'Notice that a popover of contacts appears in alphabetical order',
      'Click the contact row they want',
      'Recipient added',
    ],
  },
  {
    id: 2,
    title: 'User can search contacts by typing',
    steps: [
      'Click the input box to open the contact list',
      'Type a ***first name, last name, job title, or email*** (e.g. Maria, Consultant)',
      'Notice the list filters in real time',
      'Try a full name ***with a space*** (e.g. Sarah Parker) — results still match',
      'Clear the input to see the full alphabetical list again',
    ],
  },
  {
    id: 4,
    title: 'User can add a new person by email',
    steps: [
      'Start typing an email address (e.g. jane.doe@email.com)',
      'Notice the helper text tells the user ***they can\'t add an invalid email***',
      'Finish typing the email',
      'Notice that ***adding is now an option, and press Enter***',
    ],
    details: [
      'Addresses with a dot in the local part are parsed for first and last name — jane.doe@ → Jane Doe',
      'If the synced directory matches the contact profile is used instead',
      'If no name can be parsed, the ***edit popover opens with first name focused***',
      'Completing the profile is optional — the user can close and move on',
    ],
  },
  {
    id: 5,
    title: 'User can bulk paste or enter multiple emails',
    steps: [
      'Paste multiple emails separated by commas or spaces (e.g. alber.candari@test.com, betty@test.com, dougrocks@email.com)',
      'All valid addresses are added at once as chips',
      'Duplicates already in the list are skipped',
      'Notice that parsing is done and the user can edit if desired',
    ],
  },
  {
    id: 7,
    title: 'User can edit a recipient',
    steps: [
      'Click any chip to open the Edit Contact popover',
      'Update first name, last name, job title, or email',
      'Click Save or press Enter to confirm (Save is disabled until email is valid)',
      'Click Cancel or press Escape to discard changes and restore the previous values',
      'Click outside the popover to close it — changes made in the fields are kept',
    ],
  },
  {
    id: 6,
    title: 'Invalid emails show an error state',
    steps: [
      'Paste one or more invalid entries (e.g. notanemail) and press Enter',
      'Notice the chip appears in the error style',
      '***Single add: The edit popover opens automatically so the user can fix it***',
      'Bulk add: The popop does not appear automatically',
      'Click an error chip to open the edit popover and correct the email',
      'If the user does not fix or remove, it will be skipped at send time',
    ],
  },
  {
    id: 9,
    title: 'User can undo add or remove actions',
    steps: [
      'Add or remove one or more recipients',
      'Press ⌘Z (Mac) or Ctrl+Z (Windows)',
      'The last add/remove action is reversed (bulk paste counts as one step)',
      'Repeat to step back through up to 25 actions',
    ],
  },
  {
    id: 8,
    title: 'User can remove a recipient',
    steps: [
      'Find the chip you want to remove',
      'Click the X on the right side of the chip',
      'The recipient is removed from the input immediately',
    ],
  },
];

const parseRequirementText = (text) => {
  const parts = [];
  let lastIndex = 0;
  let match;
  const regex = /\(e\.g\.\s*([^)]+)\)|\*\*\*([^*]+)\*\*\*/g;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      let textValue = text.slice(lastIndex, match.index);
      const prevPart = parts[parts.length - 1];

      if (
        prevPart?.type === 'emphasis' &&
        match[1] !== undefined &&
        textValue.startsWith(' ')
      ) {
        prevPart.trailingSpace = true;
        textValue = textValue.slice(1);
      }

      if (textValue) {
        parts.push({ type: 'text', value: textValue });
      }
    }
    if (match[1] !== undefined) {
      parts.push({ type: 'example', value: match[1].trim() });
    } else if (match[2] !== undefined) {
      parts.push({ type: 'emphasis', value: match[2] });
    }
    lastIndex = match.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: 'text', value: text }];
};

const RequirementText = ({ text, itemKey, copiedKey, onCopy }) => {
  const parts = parseRequirementText(text);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.value}</span>;
        }

        if (part.type === 'emphasis') {
          return (
            <span key={index} className="font-bold italic">
              {part.value}
              {part.trailingSpace ? ' ' : null}
            </span>
          );
        }

        const copyKey = `${itemKey}-eg-${index}`;
        const isCopied = copiedKey === copyKey;

        return (
          <span key={index} className="inline-flex items-center flex-wrap gap-0.5 align-baseline">
            <span className="text-stone-500">(e.g.</span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[11px] font-mono text-stone-800">
              {part.value}
              <button
                type="button"
                onClick={() => onCopy(part.value, copyKey)}
                className="text-stone-400 hover:text-orange-600 transition-colors"
                aria-label={`Copy example: ${part.value}`}
              >
                {isCopied ? <ClipboardCheck size={11} strokeWidth={2.5} /> : <Copy size={11} strokeWidth={2.5} />}
              </button>
            </span>
            <span className="text-stone-500">)</span>
          </span>
        );
      })}
    </span>
  );
};

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [backupData, setBackupData] = useState(null); 
  const [isSyncedMode, setIsSyncedMode] = useState(false); // Testing toggle
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0); // For arrow key navigation
  const [expandedRequirements, setExpandedRequirements] = useState(new Set());
  const [copiedExampleKey, setCopiedExampleKey] = useState(null);
  
  const inputRef = useRef(null);
  const popoverRef = useRef(null);
  const firstNameRef = useRef(null);
  const dropdownRef = useRef(null);
  const undoStackRef = useRef([]);

  const recordUndoSnapshot = () => {
    undoStackRef.current.push(JSON.parse(JSON.stringify(recipients)));
    if (undoStackRef.current.length > 25) {
      undoStackRef.current.shift();
    }
  };

  const undoLastRecipientChange = () => {
    if (undoStackRef.current.length === 0) return false;

    const previous = undoStackRef.current.pop();
    setRecipients(previous);
    setEditingIndex(null);
    setBackupData(null);
    setInputValue('');
    setShowDropdown(false);
    return true;
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim());

  const parseInputItems = (text) =>
    text.split(/[,\s\n]+/).map((item) => item.trim()).filter(Boolean);

  const getContactSortKey = (contact) => {
    if (contact.firstName || contact.lastName) {
      return [contact.firstName, contact.lastName].filter(Boolean).join(' ').toLowerCase();
    }
    return contact.email.toLowerCase();
  };

  const getInitials = (contact) => {
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
    }
    if (contact.firstName) return contact.firstName[0].toUpperCase();
    if (contact.lastName) return contact.lastName[0].toUpperCase();

    const [localPart] = contact.email.split('@');
    const nameParts = localPart.split('.');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return localPart[0].toUpperCase();
  };

  const getAvatarColor = (contact) => {
    const key = contact.email || getContactSortKey(contact);
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  };

  const matchesContactSearch = (contact, rawQuery) => {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return true;

    const firstName = contact.firstName?.toLowerCase() || '';
    const lastName = contact.lastName?.toLowerCase() || '';
    const jobTitle = contact.jobTitle?.toLowerCase() || '';
    const email = contact.email.toLowerCase();
    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    if (
      firstName.includes(q) ||
      lastName.includes(q) ||
      jobTitle.includes(q) ||
      email.includes(q) ||
      fullName.includes(q)
    ) {
      return true;
    }

    const tokens = q.split(/\s+/).filter(Boolean);
    return tokens.every(token =>
      firstName.includes(token) ||
      lastName.includes(token) ||
      jobTitle.includes(token) ||
      email.includes(token)
    );
  };

  const availableContacts = SYNCED_DIRECTORY
    .filter(contact => !recipients.find(r => r.email === contact.email))
    .sort((a, b) => getContactSortKey(a).localeCompare(getContactSortKey(b)));

  // Show all available contacts on focus; refine as the user types
  const searchResults = inputValue.trim()
    ? availableContacts.filter(contact => matchesContactSearch(contact, inputValue))
    : availableContacts;

  const trimmedInput = inputValue.trim();
  const inputTokens = parseInputItems(inputValue);
  const validEmailTokens = inputTokens.filter(isValidEmail);
  const isBulkEmailInput = validEmailTokens.length > 1;
  const inputIsValidEmail = inputTokens.length === 1 && validEmailTokens.length === 1;
  const canAddAsEmails = validEmailTokens.length > 0 && (isBulkEmailInput || inputIsValidEmail);
  const showAddNewOption = Boolean(trimmedInput);
  const dropdownItemCount = searchResults.length + (showAddNewOption ? 1 : 0);

  // Reset selected index when search results or input change
  useEffect(() => {
    setSelectedIndex(0);
  }, [inputValue, isSyncedMode, recipients.length]);

  const toggleRequirement = (id) => {
    setExpandedRequirements((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyExample = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedExampleKey(key);
      setTimeout(() => setCopiedExampleKey(null), 2000);
    } catch {
      console.error('Copy failed');
    }
  };

  const renderRequirement = (requirement) => {
    const isExpanded = expandedRequirements.has(requirement.id);
    return (
      <div key={requirement.id}>
        <button
          type="button"
          onClick={() => toggleRequirement(requirement.id)}
          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-stone-50 transition-colors"
        >
          <span className="flex items-center gap-3 text-sm font-medium text-stone-900">
            <span className="w-6 h-6 rounded-full bg-[#FFF5EF] text-[#F44C10] border border-[#FC6839] text-xs font-semibold flex items-center justify-center shrink-0">
              {requirement.id}
            </span>
            {requirement.title}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-stone-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
        {isExpanded && (
          <div className="pr-5 pb-4 pl-14">
            <p className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-3">
              Steps
            </p>
            <ol className="space-y-2">
              {requirement.steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm text-stone-700">
                  <span className="font-semibold text-stone-500 shrink-0">{index + 1}.</span>
                  <RequirementText
                    text={step}
                    itemKey={`req-${requirement.id}-step-${index}`}
                    copiedKey={copiedExampleKey}
                    onCopy={copyExample}
                  />
                </li>
              ))}
            </ol>
            {requirement.details?.length > 0 && (
              <>
                <p className="text-[10px] font-black uppercase tracking-wider text-stone-500 mb-3 mt-5">
                  Details
                </p>
                <ul className="space-y-2">
                  {requirement.details.map((detail, index) => (
                    <li key={index} className="flex gap-3 text-sm text-stone-700">
                      <span className="text-stone-400 shrink-0">•</span>
                      <RequirementText
                        text={detail}
                        itemKey={`req-${requirement.id}-detail-${index}`}
                        copiedKey={copiedExampleKey}
                        onCopy={copyExample}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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
      isSynced: !manual || (isSyncedMode && SYNCED_DIRECTORY.find(d => d.email === contact.email)),
      id: Math.random().toString(36).substr(2, 9)
    };

    const updatedList = [...recipients, newRecipient];
    recordUndoSnapshot();
    setRecipients(updatedList);

    if (manual && (newRecipient.isInvalid || !newRecipient.firstName)) {
      startEditing(updatedList.length - 1, updatedList);
    }

    setInputValue('');
    setShowDropdown(false);
  };

  const createRecipientFromToken = (token) => {
    const textVal = token.trim();
    const directMatch = SYNCED_DIRECTORY.find(
      (d) => d.email.toLowerCase() === textVal.toLowerCase()
    );

    if (directMatch) {
      return {
        email: directMatch.email,
        firstName: directMatch.firstName || '',
        lastName: directMatch.lastName || '',
        jobTitle: directMatch.jobTitle || '',
        isInvalid: false,
        isSynced: true,
        id: Math.random().toString(36).substr(2, 9),
      };
    }

    const isEmail = isValidEmail(textVal);
    let firstName = '';
    let lastName = '';

    if (isEmail) {
      const [localPart] = textVal.split('@');
      const nameParts = localPart.split('.');
      if (nameParts.length === 2) {
        firstName = capitalize(nameParts[0]);
        lastName = capitalize(nameParts[1]);
      } else if (nameParts.length >= 3) {
        firstName = capitalize(nameParts[0]);
        lastName = capitalize(nameParts[nameParts.length - 1]);
      }
    }

    return {
      email: textVal,
      firstName,
      lastName,
      jobTitle: '',
      isInvalid: !isEmail,
      isSynced: false,
      id: Math.random().toString(36).substr(2, 9),
    };
  };

  const processInput = (text) => {
    const rawItems = parseInputItems(text);
    const existingEmails = new Set(recipients.map((r) => r.email.toLowerCase()));
    const newRecipients = [];
    let editIndex = null;

    rawItems.forEach((item) => {
      if (existingEmails.has(item.toLowerCase())) return;

      const newRecipient = createRecipientFromToken(item);
      existingEmails.add(newRecipient.email.toLowerCase());
      newRecipients.push(newRecipient);

      if (newRecipient.isInvalid || !newRecipient.firstName) {
        if (editIndex === null) {
          editIndex = recipients.length + newRecipients.length - 1;
        }
      }
    });

    if (newRecipients.length === 0) {
      setInputValue('');
      setShowDropdown(false);
      return;
    }

    const updatedList = [...recipients, ...newRecipients];
    recordUndoSnapshot();
    setRecipients(updatedList);

    if (editIndex !== null && newRecipients.length === 1) {
      startEditing(editIndex, updatedList);
    }

    setInputValue('');
    setShowDropdown(false);
  };

  const shouldProcessTokensDirectly = () => {
    const tokens = parseInputItems(inputValue);
    if (tokens.length > 1) return true;
    if (tokens.length === 1 && isValidEmail(tokens[0])) return true;
    return false;
  };

  const commitInput = () => {
    if (shouldProcessTokensDirectly()) {
      processInput(inputValue);
      return;
    }

    if (showDropdown && selectedIndex < searchResults.length) {
      addRecipient(searchResults[selectedIndex], false);
      return;
    }

    if (!inputValue.trim()) return;
    processInput(inputValue);
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
    if (showDropdown && dropdownItemCount > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % dropdownItemCount);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + dropdownItemCount) % dropdownItemCount);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        commitInput();
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      commitInput();
    } else if (e.key === ',') {
      if (inputValue.trim()) {
        e.preventDefault();
        commitInput();
      }
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      commitInput();
    }
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handlePopoverKeyDown = (e) => {
    if (e.key === 'Enter') {
      const current = recipients[editingIndex];
      if (isValidEmail(current?.email)) {
        e.preventDefault();
        setEditingIndex(null);
        setBackupData(null);
        inputRef.current?.focus();
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

  useEffect(() => {
    const handleUndoKeyDown = (e) => {
      const isUndo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey;
      if (!isUndo) return;

      const active = document.activeElement;
      const typingInPopover =
        editingIndex !== null &&
        popoverRef.current?.contains(active) &&
        active?.tagName === 'INPUT';

      if (typingInPopover) return;

      if (undoLastRecipientChange()) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleUndoKeyDown);
    return () => document.removeEventListener('keydown', handleUndoKeyDown);
  }, [editingIndex, recipients]);

  const removeRecipient = (index) => {
    const newList = [...recipients];
    newList.splice(index, 1);
    recordUndoSnapshot();
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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingIndex, recipients]);

  return (
    <div className="min-h-screen bg-stone-50 p-8 font-sans transition-colors duration-500 text-stone-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Prototype */}
          <div className="space-y-6 min-w-0">
            <h1 className="text-xl font-bold text-stone-900 font-sans tracking-tight">Recipient Input Prototype</h1>
          <div className="flex flex-col md:flex-row gap-3 items-start">
            <div className="flex-1 relative w-full">
              <div 
                className={`min-h-[56px] w-full bg-white border-2 rounded-[16px] px-3 py-2 flex flex-wrap items-center gap-2 transition-all cursor-text relative
                  ${editingIndex !== null ? 'border-[#F44C10] ring-[5px] ring-[#FFCBAC]' : 'border-stone-200 focus-within:border-[#F44C10] focus-within:ring-[5px] focus-within:ring-[#FFCBAC]'}`}
                onClick={() => inputRef.current?.focus()}
              >
                {/* Recipient Chips */}
                {recipients.map((r, idx) => {
                  const avatarColor = getAvatarColor(r);
                  return (
                  <div key={r.id} className="relative inline-block h-8">
                    <div 
                      onClick={(e) => { e.stopPropagation(); startEditing(idx); }}
                      className={`flex items-center gap-1.5 pl-1 pr-2 h-8 rounded-full text-[10px] font-medium transition-all group cursor-pointer border shadow-[0_2px_4px_-2px_rgba(48,41,33,0.15)]
                        ${r.isInvalid 
                          ? editingIndex === idx 
                            ? 'bg-[#FFD8D8] text-black border-[#D02A2A] border-dashed ring-2 ring-[#D02A2A]/20'
                            : 'bg-[#FFD8D8] text-black border-[#D02A2A] border-dashed'
                          : editingIndex === idx 
                            ? 'bg-white text-stone-900 border-[#D6D1CB] ring-1 ring-orange-400' 
                            : 'bg-white text-stone-900 border-[#D6D1CB] hover:bg-[#FFF5EF] hover:border-[#FC6839]'}
                      `}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-normal uppercase shrink-0
                        ${r.isInvalid ? 'bg-[#FFD8D8] text-[#D02A2A]' : `${avatarColor.bg} ${avatarColor.text}`}`}>
                        {r.isInvalid ? <AlertTriangle size={12} strokeWidth={2.5} className="text-[#D02A2A]" /> : getInitials(r)}
                      </div>
                      <span className="max-w-[180px] truncate">
                        {r.firstName ? `${r.firstName} ${r.lastName}` : r.email}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeRecipient(idx); }}
                        className="shrink-0 text-black"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Popover Logic */}
                    {editingIndex === idx && (
                      <div 
                        ref={popoverRef}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-5 w-80 bg-white rounded-[8px] border border-[#D0CBC6] shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 origin-top animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-[-2px_-2px_4px_rgba(0,0,0,0.04)]" />
                        <div className="relative p-6 space-y-4">
                          <h3 className="text-sm font-semibold text-stone-900 mb-6">Edit Contact</h3>

                          <input 
                            ref={firstNameRef}
                            type="text" 
                            value={r.firstName}
                            placeholder="First Name"
                            onChange={(e) => updateRecipient(idx, 'firstName', e.target.value)}
                            onKeyDown={handlePopoverKeyDown}
                            className="w-full h-10 px-4 bg-white border-2 border-stone-200 rounded-[6px] text-sm text-stone-900 font-normal transition-all focus:outline-none focus:border-[#F44C10] focus:ring-[5px] focus:ring-[#FFCBAC] placeholder:text-stone-400"
                          />
                          <input 
                            type="text" 
                            value={r.lastName}
                            placeholder="Last Name"
                            onChange={(e) => updateRecipient(idx, 'lastName', e.target.value)}
                            onKeyDown={handlePopoverKeyDown}
                            className="w-full h-10 px-4 bg-white border-2 border-stone-200 rounded-[6px] text-sm text-stone-900 font-normal transition-all focus:outline-none focus:border-[#F44C10] focus:ring-[5px] focus:ring-[#FFCBAC] placeholder:text-stone-400"
                          />
                          <input 
                            type="text" 
                            value={r.jobTitle}
                            placeholder="Job Title"
                            onChange={(e) => updateRecipient(idx, 'jobTitle', e.target.value)}
                            onKeyDown={handlePopoverKeyDown}
                            className="w-full h-10 px-4 bg-white border-2 border-stone-200 rounded-[6px] text-sm text-stone-900 font-normal transition-all focus:outline-none focus:border-[#F44C10] focus:ring-[5px] focus:ring-[#FFCBAC] placeholder:text-stone-400"
                          />
                          <div className="relative">
                            <input 
                              type="email" 
                              value={r.email}
                              placeholder="Email Address"
                              onChange={(e) => updateRecipient(idx, 'email', e.target.value)}
                              onKeyDown={handlePopoverKeyDown}
                              className={`w-full h-10 px-4 pr-8 border-2 rounded-[6px] text-sm font-normal transition-all focus:outline-none placeholder:text-stone-400
                                ${r.isInvalid 
                                  ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-400 focus:ring-[5px] focus:ring-red-100' 
                                  : 'bg-white border-stone-200 text-stone-900 focus:border-[#F44C10] focus:ring-[5px] focus:ring-[#FFCBAC]'}`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm font-bold pointer-events-none">*</span>
                          </div>

                          <div className="flex justify-between items-center pt-2">
                            <button 
                              onClick={cancelAndRevert}
                              className="text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              disabled={r.isInvalid}
                              onClick={() => { setEditingIndex(null); setBackupData(null); inputRef.current?.focus(); }}
                              className={`h-10 w-40 rounded-full text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2
                                ${!r.isInvalid 
                                  ? 'bg-[#FC6839] hover:bg-[#F05A2E] text-white' 
                                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                            >
                              Save
                              <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded
                                ${!r.isInvalid 
                                  ? 'bg-white/20 text-white' 
                                  : 'bg-stone-300/50 text-stone-400'}`}>
                                Enter
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}

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
                    onBlur={handleBlur}
                    onPaste={handlePaste}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search contacts or add by email"
                    className="w-full outline-none text-[12px] font-normal text-stone-900 bg-transparent h-8 py-0 leading-none placeholder:opacity-50"
                  />
                </div>

                {/* FULL WIDTH SYNCED DROPDOWN */}
                {showDropdown && (searchResults.length > 0 || showAddNewOption) && (
                  <div 
                    ref={dropdownRef}
                    className="absolute top-full left-0 mt-3 w-full bg-white rounded-[8px] border border-[#D0CBC6] shadow-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="max-h-[324px] overflow-y-auto">
                      {searchResults.map((contact, i) => {
                        const avatarColor = getAvatarColor(contact);
                        return (
                        <button
                          key={i}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => addRecipient(contact, false)}
                          onMouseEnter={() => setSelectedIndex(i)}
                          className={`w-full h-[50px] flex items-center gap-3 px-4 transition-colors text-left outline-none
                            ${i < searchResults.length - 1 || showAddNewOption ? 'border-b border-[#D0CBC6]' : ''}
                            ${selectedIndex === i ? 'bg-[#FFF5EF]' : 'hover:bg-[#FFF5EF]'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-normal shrink-0 ${avatarColor.bg} ${avatarColor.text}`}>
                            {getInitials(contact)}
                          </div>
                          <div className="flex flex-col gap-0 min-w-0">
                            <span className="text-[12px] font-medium text-stone-900 truncate">
                              {contact.firstName || contact.lastName
                                ? [contact.firstName, contact.lastName].filter(Boolean).join(' ')
                                : contact.email}
                            </span>
                            {(contact.jobTitle || ((contact.firstName || contact.lastName) && contact.email)) && (
                              <span className="text-[10px] font-normal text-[#6F6F6F] truncate flex items-center gap-2 min-w-0">
                                {contact.jobTitle && <span className="truncate">{contact.jobTitle}</span>}
                                {(contact.firstName || contact.lastName) && contact.email && (
                                  <span className="truncate">{contact.email}</span>
                                )}
                              </span>
                            )}
                          </div>
                        </button>
                        );
                      })}

                      {showAddNewOption && (
                      <button
                        type="button"
                        disabled={!canAddAsEmails}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => canAddAsEmails && processInput(inputValue)}
                        onMouseEnter={() => setSelectedIndex(searchResults.length)}
                        className={`w-full h-[50px] flex items-center gap-3 px-4 transition-colors text-left outline-none
                          ${!canAddAsEmails ? 'cursor-default' : ''}
                          ${selectedIndex === searchResults.length && canAddAsEmails ? 'bg-[#FFF5EF]' : canAddAsEmails ? 'hover:bg-[#FFF5EF]' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-stone-100 text-stone-400">
                          <AtSign size={14} />
                        </div>
                        <div className="flex flex-col gap-0 min-w-0">
                          <span className={`text-[12px] font-medium truncate ${canAddAsEmails ? 'text-stone-600' : 'text-stone-400'}`}>
                            {isBulkEmailInput
                              ? `Add ${validEmailTokens.length} people`
                              : inputIsValidEmail
                                ? <>Add <span>&quot;{trimmedInput}&quot;</span> as a new person</>
                                : 'Type an email to add a new person'}
                          </span>
                        </div>
                      </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>

          {/* Design Requirements */}
          <div className="lg:sticky lg:top-8 max-h-[calc(100vh-4rem)] overflow-y-auto space-y-6">
            <h2 className="text-xl font-bold text-stone-900 font-sans tracking-tight">Design Requirements</h2>
            <div className="bg-white rounded-2xl border-2 border-stone-300 overflow-hidden shadow-md">
              <div className="divide-y divide-stone-200">
                {DESIGN_REQUIREMENTS.map(renderRequirement)}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
