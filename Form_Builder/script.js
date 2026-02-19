// DOM Elements
const formPreview = document.getElementById('formPreview');
const editModal = document.getElementById('editModal');
const closeModal = document.querySelector('.close');
const saveEditBtn = document.getElementById('saveEdit');
const successMessage = document.getElementById('successMessage');

let formFields = [];
let currentEditingField = null;
let fieldIdCounter = 0;

// Drag and Drop
document.querySelectorAll('.element-item').forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
});

formPreview.addEventListener('dragover', handleDragOver);
formPreview.addEventListener('drop', handleDrop);
formPreview.addEventListener('dragleave', handleDragLeave);

function handleDragStart(e) {
    e.dataTransfer.setData('type', e.target.dataset.type);
}

function handleDragOver(e) {
    e.preventDefault();
    formPreview.classList.add('drag-over');
}

function handleDragLeave(e) {
    if (e.target === formPreview) {
        formPreview.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    formPreview.classList.remove('drag-over');
    
    const type = e.dataTransfer.getData('type');
    addField(type);
}

// Add Field
function addField(type) {
    const field = {
        id: fieldIdCounter++,
        type: type,
        label: getDefaultLabel(type),
        placeholder: 'Enter value',
        required: false,
        options: type === 'radio' || type === 'checkbox' || type === 'select' ? ['Option 1', 'Option 2', 'Option 3'] : []
    };

    formFields.push(field);
    renderForm();
}

function getDefaultLabel(type) {
    const labels = {
        text: 'Text Input',
        email: 'Email Address',
        password: 'Password',
        number: 'Number',
        textarea: 'Text Area',
        radio: 'Radio Buttons',
        checkbox: 'Checkboxes',
        select: 'Dropdown',
        date: 'Date',
        file: 'File Upload',
        submit: 'Submit'
    };
    return labels[type] || 'Field';
}

// Render Form
function renderForm() {
    if (formFields.length === 0) {
        formPreview.innerHTML = '<p class="empty-message">Drag and drop elements here to build your form</p>';
        return;
    }

    formPreview.innerHTML = formFields.map(field => createFieldHTML(field)).join('');
    attachFieldEvents();
}

function createFieldHTML(field) {
    const requiredMark = field.required ? '<span class="required">*</span>' : '';
    
    if (field.type === 'submit') {
        return `
            <div class="form-field" data-id="${field.id}">
                <div class="field-actions">
                    <button class="btn-delete" onclick="deleteField(${field.id})">Delete</button>
                </div>
                <button type="button" class="btn-submit" onclick="submitForm()">${field.label}</button>
            </div>
        `;
    }

    let inputHTML = '';
    
    switch(field.type) {
        case 'textarea':
            inputHTML = `<textarea placeholder="${field.placeholder}" ${field.required ? 'required' : ''}></textarea>`;
            break;
        case 'radio':
            inputHTML = `<div class="radio-group">
                ${field.options.map((opt, i) => `
                    <label><input type="radio" name="radio_${field.id}" value="${opt}" ${field.required && i === 0 ? 'required' : ''}> ${opt}</label>
                `).join('')}
            </div>`;
            break;
        case 'checkbox':
            inputHTML = `<div class="checkbox-group">
                ${field.options.map(opt => `
                    <label><input type="checkbox" value="${opt}"> ${opt}</label>
                `).join('')}
            </div>`;
            break;
        case 'select':
            inputHTML = `<select ${field.required ? 'required' : ''}>
                <option value="">Select an option</option>
                ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>`;
            break;
        default:
            inputHTML = `<input type="${field.type}" placeholder="${field.placeholder}" ${field.required ? 'required' : ''}>`;
    }

    return `
        <div class="form-field" data-id="${field.id}">
            <div class="field-actions">
                <button class="btn-edit" onclick="editField(${field.id})">Edit</button>
                <button class="btn-delete" onclick="deleteField(${field.id})">Delete</button>
            </div>
            <label>${field.label} ${requiredMark}</label>
            ${inputHTML}
        </div>
    `;
}

function attachFieldEvents() {
    // Events are handled via onclick in HTML for simplicity
}

// Edit Field
function editField(id) {
    currentEditingField = formFields.find(f => f.id === id);
    if (!currentEditingField) return;

    document.getElementById('editLabel').value = currentEditingField.label;
    document.getElementById('editPlaceholder').value = currentEditingField.placeholder;
    document.getElementById('editRequired').checked = currentEditingField.required;

    const optionsContainer = document.getElementById('optionsContainer');
    if (['radio', 'checkbox', 'select'].includes(currentEditingField.type)) {
        optionsContainer.style.display = 'block';
        document.getElementById('editOptions').value = currentEditingField.options.join('\n');
    } else {
        optionsContainer.style.display = 'none';
    }

    editModal.classList.add('show');
}

saveEditBtn.addEventListener('click', () => {
    if (!currentEditingField) return;

    currentEditingField.label = document.getElementById('editLabel').value;
    currentEditingField.placeholder = document.getElementById('editPlaceholder').value;
    currentEditingField.required = document.getElementById('editRequired').checked;

    if (['radio', 'checkbox', 'select'].includes(currentEditingField.type)) {
        const optionsText = document.getElementById('editOptions').value;
        currentEditingField.options = optionsText.split('\n').filter(o => o.trim());
    }

    renderForm();
    editModal.classList.remove('show');
});

closeModal.addEventListener('click', () => {
    editModal.classList.remove('show');
});

// Delete Field
function deleteField(id) {
    formFields = formFields.filter(f => f.id !== id);
    renderForm();
}

// Submit Form
function submitForm() {
    const fields = formPreview.querySelectorAll('input, textarea, select');
    let isValid = true;

    fields.forEach(field => {
        if (field.hasAttribute('required') && !field.value) {
            isValid = false;
            field.style.borderColor = '#ef4444';
        } else {
            field.style.borderColor = '#e5e7eb';
        }
    });

    if (isValid) {
        successMessage.classList.add('show');
        setTimeout(() => successMessage.classList.remove('show'), 3000);
    } else {
        alert('Please fill all required fields');
    }
}

// Save to localStorage
document.getElementById('saveBtn').addEventListener('click', () => {
    localStorage.setItem('formBuilder', JSON.stringify(formFields));
    alert('Form saved successfully!');
});

// Load from localStorage
document.getElementById('loadBtn').addEventListener('click', () => {
    const saved = localStorage.getItem('formBuilder');
    if (saved) {
        formFields = JSON.parse(saved);
        fieldIdCounter = Math.max(...formFields.map(f => f.id), 0) + 1;
        renderForm();
        alert('Form loaded successfully!');
    } else {
        alert('No saved form found');
    }
});

// Clear Form
document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the form?')) {
        formFields = [];
        renderForm();
    }
});

// Export JSON
document.getElementById('exportJsonBtn').addEventListener('click', () => {
    const json = JSON.stringify(formFields, null, 2);
    downloadFile('form-structure.json', json);
});

// Export HTML
document.getElementById('exportHtmlBtn').addEventListener('click', () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Form</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-field { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .required { color: red; }
        button { padding: 12px 30px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <form>
        ${formFields.map(field => {
            if (field.type === 'submit') {
                return `<button type="submit">${field.label}</button>`;
            }
            const requiredMark = field.required ? '<span class="required">*</span>' : '';
            let inputHTML = '';
            
            switch(field.type) {
                case 'textarea':
                    inputHTML = `<textarea placeholder="${field.placeholder}" ${field.required ? 'required' : ''}></textarea>`;
                    break;
                case 'radio':
                    inputHTML = field.options.map(opt => `<label><input type="radio" name="radio_${field.id}" value="${opt}"> ${opt}</label><br>`).join('');
                    break;
                case 'checkbox':
                    inputHTML = field.options.map(opt => `<label><input type="checkbox" value="${opt}"> ${opt}</label><br>`).join('');
                    break;
                case 'select':
                    inputHTML = `<select ${field.required ? 'required' : ''}><option value="">Select</option>${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}</select>`;
                    break;
                default:
                    inputHTML = `<input type="${field.type}" placeholder="${field.placeholder}" ${field.required ? 'required' : ''}>`;
            }
            
            return `<div class="form-field"><label>${field.label} ${requiredMark}</label>${inputHTML}</div>`;
        }).join('')}
    </form>
</body>
</html>`;
    
    downloadFile('form.html', html);
});

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize
renderForm();
