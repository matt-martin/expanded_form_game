document.addEventListener('DOMContentLoaded', () => {
    const numberDisplay = document.getElementById('numberDisplay');
    const expandedFormArea = document.getElementById('expandedFormArea');
    const generateNumberButton = document.getElementById('generateNumber');

    generateNumberButton.addEventListener('click', generateRandomNumber);

    const draggedNumber = {
        digit: null,
        placeValue: null,
        get fullValue() {
            return this.digit * this.placeValue;
        },
        createExpandedElement() {
            const element = document.createElement('div');
            element.classList.add('expanded-item');
            const valueSpan = document.createElement('span');
            valueSpan.textContent = this.fullValue;
            element.appendChild(valueSpan);
            const calculationSpan = document.createElement('span');
            calculationSpan.textContent = ` (${this.digit} x ${this.placeValue})`;
            calculationSpan.style.display = 'block';
            element.appendChild(calculationSpan);
            return element;
        },
        reset() {
            this.digit = null;
            this.placeValue = null;
        }
    };

    function makeNumberDraggable() {
        const digits = numberDisplay.querySelectorAll('.digit');
        digits.forEach((digit, index) => {
            if (digit.textContent !== '0') {
                digit.draggable = true;
                digit.addEventListener('dragstart', e => handleDragStart(e, index, digits.length, digit));
                digit.addEventListener('dragend', () => { /* handle drag end */ });
            }
        });
    }

    function handleDragStart(e, index, totalDigits, digitElement) {
        draggedNumber.digit = parseInt(e.target.textContent);
        draggedNumber.placeValue = Math.pow(10, totalDigits - index - 1);
        e.dataTransfer.setData('text/plain', e.target.textContent);

        // Delay the highlighting to avoid applying it to the clone
        setTimeout(() => {
            digitElement.classList.add('highlighted');
        }, 0);
    }

    function removeHighlight(digitElement) {
        digitElement.classList.remove('highlighted');
    }

    expandedFormArea.addEventListener('dragover', e => e.preventDefault());
    expandedFormArea.addEventListener('drop', e => {
        e.preventDefault();
        showModal();
    });

    function generateRandomNumber() {
        const randomNumber = Math.floor(Math.random() * 10000).toString();
        numberDisplay.innerHTML = ''; // Clear existing number
        expandedFormArea.innerHTML = ''; // Clear expandedFormArea
        for (let digit of randomNumber) {
            const span = document.createElement('span');
            span.textContent = digit;
            span.classList.add('digit');
            span.draggable = digit !== '0'; // Ensure zeros are not draggable
            numberDisplay.appendChild(span);
        }
        makeNumberDraggable(); // Re-attach drag event listeners
        document.getElementById('congratsMessage').style.display = 'none'; // Hide congratulatory message if visible
    }

    function showModal() {
        document.getElementById('guessModal').style.display = 'block';
    }

    function closeModal() {
        document.getElementById('guessModal').style.display = 'none';
        document.getElementById('guessFeedback').style.display = 'none'; // Clear feedback message
        document.getElementById('userGuess').value = ''; // Clear the input field
        document.querySelectorAll('.digit').forEach(digit => digit.classList.remove('highlighted')); // Remove highlighting
    }

    function checkGuess() {
        const userGuess = parseInt(document.getElementById('userGuess').value);
        const feedbackElement = document.getElementById('guessFeedback');
        const guessedDigitElement = document.querySelector('.digit.highlighted');
    
        if (userGuess === draggedNumber.fullValue) {
            feedbackElement.textContent = 'Correct!';
            feedbackElement.style.color = 'green';
            feedbackElement.style.display = 'block';
    
            setTimeout(() => {
                revealAnswer();
                if (guessedDigitElement) {
                    guessedDigitElement.textContent = '0'; // Replace the guessed digit with 0
                    guessedDigitElement.draggable = false; // Make the zero non-draggable
                    guessedDigitElement.classList.remove('highlighted');
                }
    
                checkIfAllZeros(); // Check if all digits are zeros
                closeModal();
            }, 750);
        } else {
            feedbackElement.textContent = 'Incorrect, try again!';
            feedbackElement.style.color = 'red'; // Display in red for incorrect
            feedbackElement.style.display = 'block';
        }
    }

    function checkIfAllZeros() {
        const digits = numberDisplay.querySelectorAll('.digit');
        if (Array.from(digits).every(digit => digit.textContent === '0')) {
            // Display congratulatory message
            document.getElementById('congratsMessage').style.display = 'block'; // Ensure you have this element in your HTML
        }
    }

    function revealAnswer() {
        const expandedElement = draggedNumber.createExpandedElement();
        if (expandedFormArea.childNodes.length > 0) {
            expandedFormArea.appendChild(document.createTextNode(' + '));
        }
        expandedFormArea.appendChild(expandedElement);
        draggedNumber.reset();
    }

    // Event Listener for Submit Button in Modal
    const submitButton = document.querySelector('#guessModal button');
    submitButton.addEventListener('click', checkGuess);

    // Event Listener for Close Button in Modal
    const closeButton = document.querySelector('#guessModal .close');
    closeButton.addEventListener('click', closeModal);
    // Initial call to generate a number
    generateRandomNumber();
});

