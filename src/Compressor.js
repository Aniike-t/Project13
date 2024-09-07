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
        const template = {
            "0":["0000000000000000","0005911111180000","0591111111111000","0711115491111100","2911520000911140","7111000000071190","7112000000008190","7112000000008190","7112000000008190","7112000000001190","7911000000021190","5811140000411190","0781115445111100","0088881111111500","0005555888855000","0000055555500000"],
            "13":["0000000000000000","0000000000000000","0111199997777760","0111111111111192","0333333333333322","0000000000000000","0099900000055500","0999900000069820","0911900000079820","0911006982279820","0911227997229770","0911111111119770","0711111111111870","0057888377765500","0000000000000000","0000000000000000"]
        };
        let similarities = {};
        let topKey = null;
        let maxSimilarity = 0;
        Object.keys(template).forEach(key => {
            const similarity = compareMatrices(scaledMatrix, applyReverseMappingToMatrix(convertTemplateToMatrix(template[key])));
            similarities[key] = similarity;
            console.log(`Similarity with template ${key}: ${similarity}%`);
            if (similarity > 50) {
                const alteredSimilarity = (similarity - 50) * 100 / 50;
                console.log(`Similarity altered = ${alteredSimilarity}%`);
                if (alteredSimilarity > maxSimilarity) {
                    maxSimilarity = alteredSimilarity;
                    topKey = key;
                }
            }
        });
        console.log('Topmost similarity key:', topKey);
        return topKey;
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
    return value === 1 ? 1 : value >= 0 && value <= 9 ? value / 10 : 0;
}

function compareMatrices(scaledMatrix, templateMatrix) {
    let countMatch = 0;
    let onesValueOG = 0;
    let totalScaledOnes = 0;
    const threshold = 0.5;

    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            if (templateMatrix[i][j] > threshold) {
                onesValueOG++;
                if (scaledMatrix[i][j] === 1) {
                    countMatch++;
                } else {
                    countMatch -= 1.5;
                }
            } else if (templateMatrix[i][j] >= threshold - 0.2 && scaledMatrix[i][j] === 1) {
                countMatch += 0.3;
            }
            if (scaledMatrix[i][j] === 1) {
                totalScaledOnes++;
            }
        }
    }
    return ((Math.max(0, countMatch * onesValueOG / Math.max(totalScaledOnes, 1)) / onesValueOG) * 100).toFixed(2);
}