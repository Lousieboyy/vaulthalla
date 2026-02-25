'use strict';

const byId = (id) => document.getElementById(id);

function setAlert(el, message, type = 'success') {
  if (!el) return;
  el.textContent = message;
  el.className = `alert visible ${type}`;
}

function clearAlert(el) {
  if (!el) return;
  el.textContent = '';
  el.className = 'alert';
}

function initNav() {
  const current = document.body.dataset.page;
  document.querySelectorAll('.nav-links a[data-page]').forEach((link) => {
    if (link.dataset.page === current) link.setAttribute('aria-current', 'page');
  });

  const username = sessionStorage.getItem('vh-user');
  const welcome = byId('welcomeUser');
  if (welcome && username) welcome.textContent = `Welcome back, ${username}`;
}

function initLogin() {
  const form = byId('loginForm');
  if (!form) return;
  const alert = byId('loginAlert');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearAlert(alert);

    const username = byId('username').value.trim();
    const password = byId('password').value;

    if (!/^[a-zA-Z0-9._-]{3,24}$/.test(username)) {
      return setAlert(alert, 'Username must be 3-24 characters (letters, numbers, . _ -).', 'error');
    }

    if (password.length < 8) {
      return setAlert(alert, 'Password must be at least 8 characters.', 'error');
    }

    sessionStorage.setItem('vh-user', username);
    setAlert(alert, 'Login successful. Redirecting…', 'success');
    window.setTimeout(() => window.location.assign('home-page.html'), 600);
  });
}

const notesData = [
  { faculty: 'Science', course: 'Computer Science', subject: 'Algorithms', title: 'Time Complexity Cheatsheet', summary: 'Big-O patterns, sorting costs, and graph traversal rules.' },
  { faculty: 'Science', course: 'Biology', subject: 'Cell Biology', title: 'Cell Organelles Notes', summary: 'Membrane transport, nucleus function, and metabolism overview.' },
  { faculty: 'Arts', course: 'History', subject: 'World History', title: 'Industrial Revolution Timeline', summary: 'Core events from 1760 to 1914 with key consequences.' },
  { faculty: 'Arts', course: 'Linguistics', subject: 'Phonetics', title: 'IPA Quick Revision', summary: 'Consonant and vowel mapping with articulation examples.' }
];

function buildSelectOptions(select, values) {
  const empty = select.querySelector('option[value=""]');
  select.innerHTML = '';
  if (empty) select.appendChild(empty);
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function renderNotes() {
  const list = byId('notesList');
  if (!list) return;

  const faculty = byId('faculty').value;
  const course = byId('course').value;
  const subject = byId('subject').value;
  const q = byId('search').value.trim().toLowerCase();

  const filtered = notesData.filter((note) => {
    const matchFaculty = !faculty || note.faculty === faculty;
    const matchCourse = !course || note.course === course;
    const matchSubject = !subject || note.subject === subject;
    const hay = `${note.title} ${note.summary} ${note.subject}`.toLowerCase();
    const matchQuery = !q || hay.includes(q);
    return matchFaculty && matchCourse && matchSubject && matchQuery;
  });

  list.innerHTML = '';
  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'small';
    empty.textContent = 'No notes matched your current filter.';
    list.appendChild(empty);
    return;
  }

  filtered.forEach((note) => {
    const card = document.createElement('article');
    card.className = 'card';

    const title = document.createElement('h3');
    title.className = 'note-title';
    title.textContent = note.title;

    const meta = document.createElement('p');
    meta.className = 'note-meta';
    meta.textContent = `${note.faculty} • ${note.course} • ${note.subject}`;

    const summary = document.createElement('p');
    summary.textContent = note.summary;

    card.append(title, meta, summary);
    list.appendChild(card);
  });
}

function initNotes() {
  const wrapper = byId('notesList');
  if (!wrapper) return;

  const faculties = [...new Set(notesData.map((n) => n.faculty))];
  const courses = [...new Set(notesData.map((n) => n.course))];
  const subjects = [...new Set(notesData.map((n) => n.subject))];

  buildSelectOptions(byId('faculty'), faculties);
  buildSelectOptions(byId('course'), courses);
  buildSelectOptions(byId('subject'), subjects);

  ['faculty', 'course', 'subject', 'search'].forEach((id) => {
    byId(id).addEventListener('input', renderNotes);
    byId(id).addEventListener('change', renderNotes);
  });

  const uploader = byId('imageUpload');
  const preview = byId('preview');
  const uploadAlert = byId('uploadAlert');
  if (uploader) {
    uploader.addEventListener('change', () => {
      clearAlert(uploadAlert);
      const file = uploader.files && uploader.files[0];
      if (!file) return;

      const validType = file.type.startsWith('image/');
      const maxSize = 3 * 1024 * 1024;
      if (!validType || file.size > maxSize) {
        uploader.value = '';
        return setAlert(uploadAlert, 'Please select an image under 3MB.', 'error');
      }

      const img = document.createElement('img');
      img.alt = 'Uploaded study note preview';
      img.src = URL.createObjectURL(file);
      img.onload = () => URL.revokeObjectURL(img.src);

      preview.innerHTML = '';
      preview.appendChild(img);
      setAlert(uploadAlert, 'Image preview loaded successfully.', 'success');
    });
  }

  renderNotes();
}

const flashcardsData = [
  { q: 'What is the time complexity of binary search?', a: 'O(log n)' },
  { q: 'State Newton\'s second law.', a: 'Force = mass × acceleration.' },
  { q: 'What is the capital of France?', a: 'Paris.' }
];
let flashcardIndex = 0;

function drawFlashcard() {
  const root = byId('flashcard');
  const counter = byId('cardCounter');
  if (!root || !counter) return;

  const card = flashcardsData[flashcardIndex];
  byId('flashQ').textContent = card.q;
  byId('flashA').textContent = card.a;
  root.classList.remove('is-flipped');
  counter.textContent = `Card ${flashcardIndex + 1} of ${flashcardsData.length}`;
}

function initFlashcards() {
  const shell = byId('flashcard');
  if (!shell) return;

  byId('flipBtn').addEventListener('click', () => shell.classList.toggle('is-flipped'));
  byId('nextBtn').addEventListener('click', () => {
    flashcardIndex = (flashcardIndex + 1) % flashcardsData.length;
    drawFlashcard();
  });
  byId('prevBtn').addEventListener('click', () => {
    flashcardIndex = (flashcardIndex - 1 + flashcardsData.length) % flashcardsData.length;
    drawFlashcard();
  });

  byId('newCardForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const q = byId('newQuestion').value.trim();
    const a = byId('newAnswer').value.trim();
    const alert = byId('flashAlert');
    clearAlert(alert);

    if (q.length < 4 || a.length < 2 || q.length > 180 || a.length > 180) {
      return setAlert(alert, 'Use 4-180 chars for question and 2-180 for answer.', 'error');
    }

    flashcardsData.push({ q, a });
    byId('newCardForm').reset();
    flashcardIndex = flashcardsData.length - 1;
    drawFlashcard();
    setAlert(alert, 'New flashcard added.', 'success');
  });

  drawFlashcard();
}

function initLibrary() {
  const deck = byId('libraryDeck');
  if (!deck) return;

  const contributors = [
    { name: 'Ari S.', role: 'Algorithms Lead', bio: 'Designs concise explanation-first revision cards.', img: 'profile1.png' },
    { name: 'Mira N.', role: 'Biology Curator', bio: 'Turns practical lab content into digestible notes.', img: 'profile2.png' },
    { name: 'Hanif R.', role: 'History Reviewer', bio: 'Builds timeline summaries with exam-ready context.', img: 'profile1.png' }
  ];

  contributors.forEach((person) => {
    const item = document.createElement('article');
    item.className = 'card';

    const avatar = document.createElement('img');
    avatar.src = person.img;
    avatar.alt = `${person.name} profile avatar`;
    avatar.className = 'avatar';

    const name = document.createElement('h3');
    name.textContent = person.name;

    const role = document.createElement('p');
    role.className = 'small';
    role.textContent = person.role;

    const bio = document.createElement('p');
    bio.textContent = person.bio;

    item.append(avatar, name, role, bio);
    deck.appendChild(item);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initLogin();
  initNotes();
  initFlashcards();
  initLibrary();
});
