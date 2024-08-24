export default class Compressor {
    constructor(matrix, targetSize) {
        this.matrix = matrix;
        this.targetSize = targetSize;
        this.matSize = matrix.length;
    }
    compress(threshold = 0.25, compare = false) {
        const scaledMatrix = this.createMatrix(this.targetSize);
        const blockSize = this.matSize / this.targetSize;

        for (let i = 0; i < this.targetSize; i++) {
            for (let j = 0; j < this.targetSize; j++) {
                let sum = 0, count = 0;
                for (let x = Math.floor(i * blockSize); x < Math.floor((i + 1) * blockSize); x++) {
                    for (let y = Math.floor(j * blockSize); y < Math.floor((j + 1) * blockSize); y++) {
                        if (x < this.matSize && y < this.matSize) {
                            sum += this.matrix[x][y];
                            count++;
                        }
                    }
                }
                const average = sum / count;
                scaledMatrix[i][j] = average > threshold ? 1 : 0;
            }
        }

        if (compare) {
            return this.compareWithTemplates(scaledMatrix);
        }

        return scaledMatrix;
    }

    compareWithTemplates(scaledMatrix) {
        return fetch('public/template.json')
            .then(response => response.json())
            .then(template => {
                let similarities = {};
                let topKey = null;
                let maxSimilarity = 0;

                Object.keys(template).forEach(key => {
                    const templateMatrix1 = convertTemplateToMatrix(template[key]);
                    const templateMatrix = applyReverseMappingToMatrix(templateMatrix1);
                    const similarity = compareMatrices(scaledMatrix, templateMatrix);

                    similarities[key] = similarity;
                    console.log(`Similarity with template ${key}: ${similarity}%`);
                    
                    if (similarity > 60) {
                        const alteredSimilarity = (similarity - 60) * 100 / 40;
                        console.log(`Similarity altered = ${alteredSimilarity}%`);
                        if (alteredSimilarity > maxSimilarity) {
                            maxSimilarity = alteredSimilarity;
                            topKey = key;
                        }
                    }
                });

                console.log('Topmost similarity key:', topKey);
                return topKey;
            });
    }

    createMatrix(size) {
        return Array(size).fill(null).map(() => Array(size).fill(0));
    }
}


function convertTemplateToMatrix(templateArray) {
    return templateArray.map(row => row.split('').map(Number));
}

function applyReverseMappingToMatrix(matrix) {
    return matrix.map(row => row.map(reverseMapToAverage));
}

function reverseMapToAverage(value) {
    switch(value) {
        case 9: return 0.9;
        case 8: return 0.8;
        case 7: return 0.7;
        case 6: return 0.6;
        case 5: return 0.5;
        case 4: return 0.4;
        case 3: return 0.3;
        case 2: return 0.2;
        case 1: return 1;
        case 0: return 0.0;
        default: return 0.0; 
    }
}
function compareMatrices(scaledMatrix, templateMatrix) {
    let countMatch = 0;
    let onesValueOG = 0;
    let totalScaledOnes = 0;
    const threshold = 0.5;

    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            const scaledValue = scaledMatrix[i][j];
            const templateValue = templateMatrix[i][j];

            if (templateValue > threshold) {
                onesValueOG++;
                if (scaledValue === 1) {
                    countMatch++;
                } else {
                    countMatch -= 1.3;
                }
            } else if (templateValue >= threshold - 0.2 && scaledValue === 1) {
                countMatch += 0.3;
            }

            if (scaledValue === 1) {
                totalScaledOnes++;
            }
        }
    }
    const balanceFactor = onesValueOG / Math.max(totalScaledOnes, 1);
    countMatch = countMatch * balanceFactor;
    countMatch = Math.max(0, countMatch);
    const similarity = (countMatch / onesValueOG) * 100;
    return similarity.toFixed(2);
}