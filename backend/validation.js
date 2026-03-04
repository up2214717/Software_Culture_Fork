//Registration Validation

export function isEmailValid(email) {
    if (email.includes(" ")) return false;
    if (!email.includes("@")) return false;
    return true;
}


export function checkPasswordLength(password) {
    return password.length >= 8;
}


export function checkCharacterMix(password) {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()\-+={}\[\]:;"'<>,.?\/|\\]/.test(password);
    return hasUpper && hasLower && hasNumber && hasSpecial;
}


export function isFirstNameValid(name) {
    return /^[A-Za-z]+$/.test(name);
}


export function isLastNameValid(name) {
    return /^[A-Za-z]+$/.test(name);
}


// Login Validation

export function loginValid(email, password) {
    return email.trim() !== '' && password.trim() !== '';
}



//Group creation validation
export function groupIdValid(id) {
    return /^\d{5}$/.test(id);
}


export function groupNameValid(name) {
    return name.length > 0 && name.length <= 50;
}


export function groupDescriptionValid(desc) {
    return desc.length <= 200;
}


//Task Validation
export function isTaskTitleValid(title) {
    return title.length > 0 && title.length <= 50;
}


export function isTaskDescriptionValid(desc) {
    return desc.length <= 200;
}


export function isTaskDeadlineValid() {
    const input = document.querySelector("#task-deadline");
    if (!input || !input.value) return false;
    const today = new Date();
    const selected = new Date(input.value);
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    return selected >= today;
}


// Cost Validation
export function isCostAmountValid() {
    const input = document.querySelector("#cost-amount");
    return /^\d+(\.\d{1,2})?$/.test(input?.value || '');
}



export function isCostDescriptionValid(desc) {
    return desc.length <= 200;
}


export function isCostDeadlineValid() {
    const input = document.querySelector("#cost-deadline");
    if (!input || !input.value) return false;
    const today = new Date();
    const selected = new Date(input.value);
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    return selected >= today;
}



















