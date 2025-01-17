const n = 40;
const array = [];
init();
let audioCtx = null;

function playNote(freq) {
    if (audioCtx == null) {
        audioCtx = new (AudioContext || webkitAudioContext || window.webkitAudioContext)();
    }
    const dur = 0.1;
    const osc = audioCtx.createOscillator();
    osc.frequency.value = freq;
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
    const node = audioCtx.createGain();
    node.gain.value = 0.1;
    node.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
    osc.connect(node);
    node.connect(audioCtx.destination);
}
function animate(moves) {
    if (moves.length == 0) {
        showBars();
        return;
    }
    const move = moves.shift();
    const [i, j] = move.indices;
    if (move.type == "swap") {
        [array[i], array[j]] = [array[j], array[i]];
    } else if (move.type == "overwrite") {
        array[i] = move.value;
    }
    playNote(200 + array[i] * 500);
    playNote(200 + array[j] * 500);
    showBars(move);
    setTimeout(function () {
        animate(moves);
    }, 50);
}
function init() {
    for (let i = 0; i < n; i++) {
        array[i] = Math.random();
    }
    showBars();
}

function showBars(move) {
    const container = document.getElementById("container");
    container.innerHTML = "";
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = array[i] * 100 + "%";
        bar.classList.add("bar");
        if (move && move.indices.includes(i)) {
            bar.style.backgroundColor = move.type == "swap" ? "red" : "blue";
        }
        container.appendChild(bar);
    }
}

function play(sortType) {
    const copy = [...array];
    let moves;
    switch (sortType) {
        case 'insertionSort':
            moves = insertionSort(copy);
            break;
        case 'selectionSort':
            moves = selectionSort(copy);
            break;
        case 'mergeSort':
            moves = mergeSort(copy);
            break;
        case 'quickSort':
            moves = quickSort(copy);
            break;
        case 'heapSort':
            moves = heapSort(copy);
            break;
        default:
            moves = bubbleSort(copy);
            break;
    }
    animate(moves);
}

function bubbleSort(array) {
    const moves = [];
    do {
        var swapped = false;
        for (let i = 1; i < array.length; i++) {
            if (array[i - 1] > array[i]) {
                swapped = true;
                moves.push({ indices: [i - 1, i], type: "swap" });
                [array[i - 1], array[i]] = [array[i], array[i - 1]];
            }
        }
    } while (swapped);
    return moves;
}

function insertionSort(array) {
    const moves = [];
    for (let i = 1; i < array.length; i++) {
        let j = i;
        while (j > 0 && array[j - 1] > array[j]) {
            moves.push({ indices: [j - 1, j], type: "swap" });
            [array[j - 1], array[j]] = [array[j], array[j - 1]];
            j--;
        }
    }
    return moves;
}

function selectionSort(array) {
    const moves = [];
    for (let i = 0; i < array.length; i++) {
        let minIndex = i;
        for (let j = i + 1; j < array.length; j++) {
            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex !== i) {
            moves.push({ indices: [i, minIndex], type: "swap" });
            [array[i], array[minIndex]] = [array[minIndex], array[i]];
        }
    }
    return moves;
}

function mergeSort(array) {
    const moves = [];

    function merge(left, right, startIdx) {
        let result = [];
        let leftIdx = 0;
        let rightIdx = 0;
        while (leftIdx < left.length && rightIdx < right.length) {
            if (left[leftIdx] < right[rightIdx]) {
                result.push(left[leftIdx]);
                leftIdx++;
            } else {
                result.push(right[rightIdx]);
                rightIdx++;
            }
        }
        result = result.concat(left.slice(leftIdx)).concat(right.slice(rightIdx));
        for (let i = 0; i < result.length; i++) {
            moves.push({ indices: [startIdx + i, startIdx + i], type: "overwrite", value: result[i] });
        }
        return result;
    }

    function mergeSortRecursive(arr, startIdx = 0) {
        if (arr.length < 2) return arr;
        const mid = Math.floor(arr.length / 2);
        const left = mergeSortRecursive(arr.slice(0, mid), startIdx);
        const right = mergeSortRecursive(arr.slice(mid), startIdx + mid);
        return merge(left, right, startIdx);
    }

    mergeSortRecursive(array);
    return moves;
}

function quickSort(array) {
    const moves = [];

    function partition(arr, left, right) {
        const pivotValue = arr[right];
        let i = left;
        for (let j = left; j < right; j++) {
            if (arr[j] < pivotValue) {
                moves.push({ indices: [i, j], type: "swap" });
                [arr[i], arr[j]] = [arr[j], arr[i]];
                i++;
            }
        }
        moves.push({ indices: [i, right], type: "swap" });
        [arr[i], arr[right]] = [arr[right], arr[i]];
        return i;
    }

    function quickSortRecursive(arr, left, right) {
        if (left < right) {
            const pivot = partition(arr, left, right);
            quickSortRecursive(arr, left, pivot - 1);
            quickSortRecursive(arr, pivot + 1, right);
        }
    }

    quickSortRecursive(array, 0, array.length - 1);
    return moves;
}

function heapSort(array) {
    const moves = [];

    function heapify(arr, n, i) {
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;
        if (left < n && arr[left] > arr[largest]) {
            largest = left;
        }
        if (right < n && arr[right] > arr[largest]) {
            largest = right;
        }
        if (largest !== i) {
            moves.push({ indices: [i, largest], type: "swap" });
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            heapify(arr, n, largest);
        }
    }

    function buildMaxHeap(arr) {
        let n = arr.length;
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            heapify(arr, n, i);
        }
    }

    function heapSortHelper(arr) {
        buildMaxHeap(arr);
        for (let i = arr.length - 1; i > 0; i--) {
            moves.push({ indices: [0, i], type: "swap" });
            [arr[0], arr[i]] = [arr[i], arr[0]];
            heapify(arr, i, 0);
        }
    }

    heapSortHelper(array);
    return moves;
}


// const n = 10;
// const array = [];
// let trafficData = []; 

// init(); 
// function playNote(freq) {
//     if (audioCtx == null) {
//         audioCtx = new (AudioContext || webkitAudioContext || window.webkitAudioContext)();
//     }
//     const dur = 0.1;
//     const osc = audioCtx.createOscillator();
//     osc.frequency.value = freq;
//     osc.start();
//     osc.stop(audioCtx.currentTime + dur);
//     const node = audioCtx.createGain();
//     node.gain.value = 0.1;
//     node.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
//     osc.connect(node);
//     node.connect(audioCtx.destination);
// }

// function init() {
//     for (let i = 0; i < n; i++) {
//         array[i] = Math.random();
//     }
//     showBars();
// }

// function play(sortType) {
//     const copy = [...array];
//     let moves;
//     switch (sortType) {
//         case 'insertionSort':
//             moves = insertionSort(copy);
//             break;
//         case 'selectionSort':
//             moves = selectionSort(copy);
//             break;
//         case 'mergeSort':
//             moves = mergeSort(copy);
//             break;
//         case 'quickSort':
//             moves = quickSort(copy);
//             break;
//         case 'heapSort':
//             moves = heapSort(copy);
//             break;
//         default:
//             moves = bubbleSort(copy);
//             break;
//     }
//     animate(moves);
// }

// function animate(moves) {
//     if (moves.length == 0) {
//         showBars();
//         return;
//     }
//     const move = moves.shift();
//     const [i, j] = move.indices;
//     if (move.type == "swap") {
//         [array[i], array[j]] = [array[j], array[i]];
//     } else if (move.type == "overwrite") {
//         array[i] = move.value;
//     }
//     playNote(200 + array[i] * 500);
//     playNote(200 + array[j] * 500);
//     showBars(move);
//     setTimeout(function () {
//         animate(moves);
//     }, 50);
// }

// function bubbleSort(array) {
//     const moves = [];
//     do {
//         var swapped = false;
//         for (let i = 1; i < array.length; i++) {
//             if (array[i - 1] > array[i]) {
//                 swapped = true;
//                 moves.push({ indices: [i - 1, i], type: "swap" });
//                 [array[i - 1], array[i]] = [array[i], array[i - 1]];
//             }
//         }
//     } while (swapped);
//     return moves;
// }

// function insertionSort(array) {
//     const moves = [];
//     for (let i = 1; i < array.length; i++) {
//         let j = i;
//         while (j > 0 && array[j - 1] > array[j]) {
//             moves.push({ indices: [j - 1, j], type: "swap" });
//             [array[j - 1], array[j]] = [array[j], array[j - 1]];
//             j--;
//         }
//     }
//     return moves;
// }

// function selectionSort(array) {
//     const moves = [];
//     for (let i = 0; i < array.length; i++) {
//         let minIndex = i;
//         for (let j = i + 1; j < array.length; j++) {
//             if (array[j] < array[minIndex]) {
//                 minIndex = j;
//             }
//         }
//         if (minIndex !== i) {
//             moves.push({ indices: [i, minIndex], type: "swap" });
//             [array[i], array[minIndex]] = [array[minIndex], array[i]];
//         }
//     }
//     return moves;
// }

// function mergeSort(array) {
//     const moves = [];

//     function merge(left, right, startIdx) {
//         let result = [];
//         let leftIdx = 0;
//         let rightIdx = 0;
//         while (leftIdx < left.length && rightIdx < right.length) {
//             if (left[leftIdx] < right[rightIdx]) {
//                 result.push(left[leftIdx]);
//                 leftIdx++;
//             } else {
//                 result.push(right[rightIdx]);
//                 rightIdx++;
//             }
//         }
//         result = result.concat(left.slice(leftIdx)).concat(right.slice(rightIdx));
//         for (let i = 0; i < result.length; i++) {
//             moves.push({ indices: [startIdx + i, startIdx + i], type: "overwrite", value: result[i] });
//         }
//         return result;
//     }

//     function mergeSortRecursive(arr, startIdx = 0) {
//         if (arr.length < 2) return arr;
//         const mid = Math.floor(arr.length / 2);
//         const left = mergeSortRecursive(arr.slice(0, mid), startIdx);
//         const right = mergeSortRecursive(arr.slice(mid), startIdx + mid);
//         return merge(left, right, startIdx);
//     }

//     mergeSortRecursive(array);
//     return moves;
// }

// function quickSort(array) {
//     const moves = [];

//     function partition(arr, left, right) {
//         const pivotValue = arr[right];
//         let i = left;
//         for (let j = left; j < right; j++) {
//             if (arr[j] < pivotValue) {
//                 moves.push({ indices: [i, j], type: "swap" });
//                 [arr[i], arr[j]] = [arr[j], arr[i]];
//                 i++;
//             }
//         }
//         moves.push({ indices: [i, right], type: "swap" });
//         [arr[i], arr[right]] = [arr[right], arr[i]];
//         return i;
//     }

//     function quickSortRecursive(arr, left, right) {
//         if (left < right) {
//             const pivot = partition(arr, left, right);
//             quickSortRecursive(arr, left, pivot - 1);
//             quickSortRecursive(arr, pivot + 1, right);
//         }
//     }

//     quickSortRecursive(array, 0, array.length - 1);
//     return moves;
// }

// function heapSort(array) {
//     const moves = [];

//     function heapify(arr, n, i) {
//         let largest = i;
//         let left = 2 * i + 1;
//         let right = 2 * i + 2;
//         if (left < n && arr[left] > arr[largest]) {
//             largest = left;
//         }
//         if (right < n && arr[right] > arr[largest]) {
//             largest = right;
//         }
//         if (largest !== i) {
//             moves.push({ indices: [i, largest], type: "swap" });
//             [arr[i], arr[largest]] = [arr[largest], arr[i]];
//             heapify(arr, n, largest);
//         }
//     }

//     function buildMaxHeap(arr) {
//         let n = arr.length;
//         for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
//             heapify(arr, n, i);
//         }
//     }

//     function heapSortHelper(arr) {
//         buildMaxHeap(arr);
//         for (let i = arr.length - 1; i > 0; i--) {
//             moves.push({ indices: [0, i], type: "swap" });
//             [arr[0], arr[i]] = [arr[i], arr[0]];
//             heapify(arr, i, 0);
//         }
//     }

//     heapSortHelper(array);
//     return moves;
// }

// function uploadTraffic() {
//     const fileInput = document.getElementById('fileInput');
//     const file = fileInput.files[0];
//     const reader = new FileReader();

//     reader.onload = function(e) {
//         const contents = e.target.result;
//         trafficData = parseCSV(contents); 
//         visualizeTraffic();
//     };

//     reader.readAsText(file);
// }

// function parseCSV(csv) {
//     const lines = csv.split('\n');
//     const headers = lines[0].split(',');
//     const data = [];

//     for (let i = 1; i < lines.length; i++) {
//         if (lines[i].trim() === '') continue;
//         const values = lines[i].split(',');
//         const entry = {};
//         for (let j = 0; j < headers.length; j++) {
//             entry[headers[j].trim()] = values[j].trim();
//         }
//         data.push(entry);
//     }

//     return data;
// }

// function visualizeTraffic() {
//     const container = document.getElementById('container');
//     container.innerHTML = '';

//     for (let i = 0; i < trafficData.length; i++) {
//         const trafficEntry = trafficData[i];
//         const bar = document.createElement('div');
//         bar.style.height = trafficEntry.bytes / 1000 + 'px'; 
//         bar.classList.add('traffic-bar');
//         container.appendChild(bar);
//     }
// }

// function showBars(move) {
//     const container = document.getElementById("container");
//     container.innerHTML = "";
//     for (let i = 0; i < array.length; i++) {
//         const bar = document.createElement("div");
//         bar.style.height = array[i] * 100 + "%";
//         bar.classList.add("bar");
//         if (move && move.indices.includes(i)) {
//             bar.style.backgroundColor = move.type == "swap" ? "red" : "blue";
//         }
//         container.appendChild(bar);
//     }
// }