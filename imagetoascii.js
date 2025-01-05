document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

function handleFileSelect(event) {
    const file = event.target.files[0];

        // This Defines a maximum file size (5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes

    // This Checks if the file is too large
    if (file.size > maxFileSize) {
        alert('The file is too large. Please select a file smaller than 5MB.');
        return; // Exit the function if the file is too large
    }

    // This is Checking if the file is an image (jpg, png, gif)
    if (file && (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/gif")) {
        const reader = new FileReader();

        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                createAscii(img);
            };
            img.src = event.target.result;
        };

        reader.readAsDataURL(file);
    } else {
        // alerts the user if they did not select any of these image types
        alert('Please select a valid image file (.jpg, .png, .gif).');
    }
}

function createAscii(img) {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const ascii = document.getElementById('ascii');

    // Determines the scale factor to maintain aspect ratio CURRENT 100 x 100
    const maxDimension = 100;
    let scaleFactor = Math.min(maxDimension / img.width, maxDimension / img.height);

    canvas.width = img.width * scaleFactor;
    canvas.height = img.height * scaleFactor;

    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    let asciiImage = '';
    const grayScales = '.\'`^"\\,:;Il!i><~+-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao#MW&8%B@$';
    for (let i = 0; i < imgData.data.length; i += 4) {
    const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
    const contrastedAvg = increaseContrast(avg, 2); // Assuming you have a contrast adjustment function
    const color = Math.round((grayScales.length - 1) * contrastedAvg / 255);
    asciiImage += grayScales[color];

    // Check if the end of a row is reached and it's not the very first iteration
    if (((i / 4 + 1) % canvas.width === 0) && (i !== 0)) {
        asciiImage += '\n';
    }
}

// To handle the last character, check if there was no newline added at the end
    if (imgData.data.length / 4 % canvas.width !== 0) {
        asciiImage += '\n'; // Add a newline if the last row wasn't complete
    }

    ascii.textContent = asciiImage;
}

function increaseContrast(avg, contrast) {
    return (((avg / 255 - 0.5) * contrast + 0.5) * 255).clamp(0, 255);
}

// Clamp function to keep values in range
Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

document.getElementById('copyButton').addEventListener('click', function() {
    const asciiArt = document.getElementById('ascii').innerText;
    navigator.clipboard.writeText(asciiArt).then(() => {
        alert('ASCII art copied to clipboard!');
    }).catch(err => {
        console.error('Error in copying text: ', err);
    });
});
