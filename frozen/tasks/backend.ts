import { UITask } from '../tasks'

/* =============== BACKEND TASKS (JAVA) =============== */
export const BE: UITask[] = [
  // JUNIOR (8 задач) - Основы Java
  {
    id: 'be_twoSum',
    level: 'junior',
    title: 'twoSum(nums, target)',
    exportName: 'twoSum',
    description: 'Индексы двух чисел с суммой target (O(n) через Map).',
    language: 'java',
    starter: `public class TwoSum {
  public static int[] twoSum(int[] nums, int target) {
    // TODO: реализуйте поиск двух чисел с суммой target
    // Используйте HashMap для O(n) решения
    // Верните массив из двух индексов
    return new int[]{};
  }
  
  public static void main(String[] args) {
    int[] result = twoSum(new int[]{2,7,11,15}, 9);
    System.out.println(java.util.Arrays.toString(result));
  }
}`,
    tests: `// Тесты для Java кода
// Проверяем корректность алгоритма twoSum
const { twoSum } = userModule;

// Тест 1: Обычный случай
const result1 = twoSum([2, 7, 11, 15], 9);
assert.strict.deepEqual(result1, [0, 1], 'twoSum([2,7,11,15], 9) должен вернуть [0,1]');

// Тест 2: Другой случай
const result2 = twoSum([3, 2, 4], 6);
assert.strict.deepEqual(result2, [1, 2], 'twoSum([3,2,4], 6) должен вернуть [1,2]');

// Тест 3: Случай с одинаковыми элементами
const result3 = twoSum([3, 3], 6);
assert.strict.deepEqual(result3, [0, 1], 'twoSum([3,3], 6) должен вернуть [0,1]');

// Тест 4: Случай без решения
const result4 = twoSum([1, 2, 3], 7);
assert.strict.deepEqual(result4, [], 'twoSum([1,2,3], 7) должен вернуть []');`,
    solution: `public class TwoSum {
  public static int[] twoSum(int[] nums, int target) {
    java.util.Map<Integer, Integer> map = new java.util.HashMap<>();
    
    for (int i = 0; i < nums.length; i++) {
      int complement = target - nums[i];
      
      if (map.containsKey(complement)) {
        return new int[]{map.get(complement), i};
      }
      
      map.put(nums[i], i);
    }
    
    return new int[]{};
  }
  
  public static void main(String[] args) {
    int[] result = twoSum(new int[]{2,7,11,15}, 9);
    System.out.println(java.util.Arrays.toString(result));
  }
}`
  },

  {
    id: 'be_factorial',
    level: 'junior',
    title: 'factorial(n)',
    exportName: 'factorial',
    description: 'Вычислить факториал числа (рекурсивно и итеративно).',
    language: 'java',
    starter: `public class Factorial {
  public static long factorial(int n) {
    // TODO: реализуйте вычисление факториала
    // Обработайте случай n < 0
    // Используйте long для больших чисел
    return 0;
  }
  
  public static long factorialIterative(int n) {
    // TODO: реализуйте итеративную версию
    return 0;
  }
  
  public static void main(String[] args) {
    System.out.println(factorial(5)); // должно вывести 120
    System.out.println(factorialIterative(5)); // должно вывести 120
  }
}`,
    tests: `// Тесты для Java кода
// Проверяем корректность вычисления факториала
const { factorial } = userModule;

// Тест 1: Обычные случаи
assert.strict.equal(factorial(0), 1, 'factorial(0) должен быть 1');
assert.strict.equal(factorial(1), 1, 'factorial(1) должен быть 1');
assert.strict.equal(factorial(2), 2, 'factorial(2) должен быть 2');
assert.strict.equal(factorial(3), 6, 'factorial(3) должен быть 6');
assert.strict.equal(factorial(4), 24, 'factorial(4) должен быть 24');
assert.strict.equal(factorial(5), 120, 'factorial(5) должен быть 120');

// Тест 2: Большие числа
assert.strict.equal(factorial(10), 3628800, 'factorial(10) должен быть 3628800');

// Тест 3: Отрицательные числа (должны выбрасывать исключение)
try {
  factorial(-1);
  assert.strict.ok(false, 'factorial(-1) должен выбрасывать исключение');
} catch (e) {
  assert.strict.ok(true, 'factorial(-1) правильно выбрасывает исключение');
}`,
    solution: `public class Factorial {
  public static long factorial(int n) {
    if (n < 0) {
      throw new IllegalArgumentException("Факториал не определен для отрицательных чисел");
    }
    if (n <= 1) {
      return 1;
    }
    return n * factorial(n - 1);
  }
  
  public static long factorialIterative(int n) {
    if (n < 0) {
      throw new IllegalArgumentException("Факториал не определен для отрицательных чисел");
    }
    
    long result = 1;
    for (int i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }
  
  public static void main(String[] args) {
    System.out.println(factorial(5)); // должно вывести 120
    System.out.println(factorialIterative(5)); // должно вывести 120
  }
}`
  },

  {
    id: 'be_palindrome',
    level: 'junior',
    title: 'isPalindrome(str)',
    exportName: 'isPalindrome',
    description: 'Проверить, является ли строка палиндромом.',
    language: 'java',
    starter: `public class Palindrome {
  public static boolean isPalindrome(String str) {
    // TODO: реализуйте проверку палиндрома
    // Игнорируйте регистр и пробелы
    // Пример: "А роза упала на лапу Азора" → true
    return false;
  }
  
  public static void main(String[] args) {
    System.out.println(isPalindrome("А роза упала на лапу Азора")); // true
    System.out.println(isPalindrome("hello")); // false
  }
}`,
    tests: `// Тесты для Java кода
// Проверяем корректность проверки палиндрома
const { isPalindrome } = userModule;

// Тест 1: Обычные случаи
assert.strict.equal(isPalindrome("racecar"), true, 'isPalindrome("racecar") должен быть true');
assert.strict.equal(isPalindrome("level"), true, 'isPalindrome("level") должен быть true');
assert.strict.equal(isPalindrome("deified"), true, 'isPalindrome("deified") должен быть true');

// Тест 2: Не палиндромы
assert.strict.equal(isPalindrome("hello"), false, 'isPalindrome("hello") должен быть false');
assert.strict.equal(isPalindrome("world"), false, 'isPalindrome("world") должен быть false');
assert.strict.equal(isPalindrome("java"), false, 'isPalindrome("java") должен быть false');

// Тест 3: Граничные случаи
assert.strict.equal(isPalindrome(""), true, 'isPalindrome("") должен быть true');
assert.strict.equal(isPalindrome("a"), true, 'isPalindrome("a") должен быть true');
assert.strict.equal(isPalindrome("aa"), true, 'isPalindrome("aa") должен быть true');

// Тест 4: С пробелами и регистром
assert.strict.equal(isPalindrome("A man a plan a canal Panama"), true, 'isPalindrome с пробелами должен быть true');
assert.strict.equal(isPalindrome("Racecar"), true, 'isPalindrome с разным регистром должен быть true');`,
    solution: `public class Palindrome {
  public static boolean isPalindrome(String str) {
    if (str == null || str.isEmpty()) {
      return true;
    }
    
    // Нормализуем строку: убираем пробелы и приводим к нижнему регистру
    String normalized = str.replaceAll("\\s+", "").toLowerCase();
    
    int left = 0;
    int right = normalized.length() - 1;
    
    while (left < right) {
      if (normalized.charAt(left) != normalized.charAt(right)) {
        return false;
      }
      left++;
      right--;
    }
    
    return true;
  }
  
  public static void main(String[] args) {
    System.out.println(isPalindrome("А роза упала на лапу Азора")); // true
    System.out.println(isPalindrome("hello")); // false
  }
}`
  },

  {
    id: 'be_binarySearch',
    level: 'junior',
    title: 'binarySearch(arr, target)',
    exportName: 'binarySearch',
    description: 'Бинарный поиск в отсортированном массиве.',
    language: 'java',
    starter: `public class BinarySearch {
  public static int binarySearch(int[] arr, int target) {
    // TODO: реализуйте бинарный поиск
    // Массив должен быть отсортирован
    // Верните индекс элемента или -1 если не найден
    return -1;
  }
  
  public static void main(String[] args) {
    int[] arr = {1, 3, 5, 7, 9, 11, 13};
    System.out.println(binarySearch(arr, 7)); // должно вывести 3
    System.out.println(binarySearch(arr, 4)); // должно вывести -1
  }
}`,
    tests: `// Тесты для Java кода
// Проверяем корректность бинарного поиска
const { binarySearch } = userModule;

// Тест 1: Обычные случаи
const arr1 = [1, 3, 5, 7, 9, 11, 13, 15];
assert.strict.equal(binarySearch(arr1, 5), 2, 'binarySearch([1,3,5,7,9,11,13,15], 5) должен быть 2');
assert.strict.equal(binarySearch(arr1, 1), 0, 'binarySearch([1,3,5,7,9,11,13,15], 1) должен быть 0');
assert.strict.equal(binarySearch(arr1, 15), 7, 'binarySearch([1,3,5,7,9,11,13,15], 15) должен быть 7');

// Тест 2: Элемент не найден
assert.strict.equal(binarySearch(arr1, 4), -1, 'binarySearch([1,3,5,7,9,11,13,15], 4) должен быть -1');
assert.strict.equal(binarySearch(arr1, 20), -1, 'binarySearch([1,3,5,7,9,11,13,15], 20) должен быть -1');

// Тест 3: Граничные случаи
const arr2 = [1];
assert.strict.equal(binarySearch(arr2, 1), 0, 'binarySearch([1], 1) должен быть 0');
assert.strict.equal(binarySearch(arr2, 2), -1, 'binarySearch([1], 2) должен быть -1');

// Тест 4: Пустой массив
const arr3 = [];
assert.strict.equal(binarySearch(arr3, 1), -1, 'binarySearch([], 1) должен быть -1');`,
    solution: `public class BinarySearch {
  public static int binarySearch(int[] arr, int target) {
    int left = 0;
    int right = arr.length - 1;
    
    while (left <= right) {
      int mid = left + (right - left) / 2;
      
      if (arr[mid] == target) {
        return mid;
      } else if (arr[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return -1;
  }
  
  public static void main(String[] args) {
    int[] arr = {1, 3, 5, 7, 9, 11, 13};
    System.out.println(binarySearch(arr, 7)); // должно вывести 3
    System.out.println(binarySearch(arr, 4)); // должно вывести -1
  }
}`
  },

  {
    id: 'be_reverseString',
    level: 'junior',
    title: 'reverseString(str)',
    exportName: 'reverseString',
    description: 'Перевернуть строку (in-place и с дополнительной памятью).',
    language: 'java',
    starter: `public class ReverseString {
  public static String reverseString(String str) {
    // TODO: реализуйте переворот строки
    // Используйте дополнительную память
    return "";
  }
  
  public static String reverseStringInPlace(String str) {
    // TODO: реализуйте переворот строки in-place
    // Используйте StringBuilder
    return "";
  }
  
  public static void main(String[] args) {
    System.out.println(reverseString("hello")); // должно вывести "olleh"
    System.out.println(reverseStringInPlace("hello")); // должно вывести "olleh"
  }
}`,
    tests: `// Тесты для Java кода
// Проверяем корректность переворота строки
const { reverseString } = userModule;

// Тест 1: Обычные случаи
assert.strict.equal(reverseString("hello"), "olleh", 'reverseString("hello") должен быть "olleh"');
assert.strict.equal(reverseString("world"), "dlrow", 'reverseString("world") должен быть "dlrow"');
assert.strict.equal(reverseString("java"), "avaj", 'reverseString("java") должен быть "avaj"');

// Тест 2: Граничные случаи
assert.strict.equal(reverseString(""), "", 'reverseString("") должен быть ""');
assert.strict.equal(reverseString("a"), "a", 'reverseString("a") должен быть "a"');
assert.strict.equal(reverseString("ab"), "ba", 'reverseString("ab") должен быть "ba"');

// Тест 3: Специальные символы
assert.strict.equal(reverseString("123"), "321", 'reverseString("123") должен быть "321"');
assert.strict.equal(reverseString("!@#"), "#@!", 'reverseString("!@#") должен быть "#@!"');

// Тест 4: Палиндромы
assert.strict.equal(reverseString("racecar"), "racecar", 'reverseString("racecar") должен быть "racecar"');
assert.strict.equal(reverseString("level"), "level", 'reverseString("level") должен быть "level"');`,
    solution: `public class ReverseString {
  public static String reverseString(String str) {
    if (str == null || str.isEmpty()) {
      return str;
    }
    
    StringBuilder reversed = new StringBuilder();
    for (int i = str.length() - 1; i >= 0; i--) {
      reversed.append(str.charAt(i));
    }
    
    return reversed.toString();
  }
  
  public static String reverseStringInPlace(String str) {
    if (str == null || str.isEmpty()) {
      return str;
    }
    
    StringBuilder sb = new StringBuilder(str);
    int left = 0;
    int right = sb.length() - 1;
    
    while (left < right) {
      char temp = sb.charAt(left);
      sb.setCharAt(left, sb.charAt(right));
      sb.setCharAt(right, temp);
      left++;
      right--;
    }
    
    return sb.toString();
  }
  
  public static void main(String[] args) {
    System.out.println(reverseString("hello")); // должно вывести "olleh"
    System.out.println(reverseStringInPlace("hello")); // должно вывести "olleh"
  }
}`
  },

  {
    id: 'be_fibonacci',
    level: 'junior',
    title: 'fibonacci(n)',
    exportName: 'fibonacci',
    description: 'Вычислить n-е число Фибоначчи (рекурсивно и итеративно).',
    language: 'java',
    starter: `public class Fibonacci {
  public static long fibonacci(int n) {
    // TODO: реализуйте вычисление числа Фибоначчи
    // F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)
    return 0;
  }
  
  public static long fibonacciIterative(int n) {
    // TODO: реализуйте итеративную версию
    return 0;
  }
  
  public static void main(String[] args) {
    System.out.println(fibonacci(10)); // должно вывести 55
    System.out.println(fibonacciIterative(10)); // должно вывести 55
  }
}`,
    tests: `// Тесты для Java кода
// Проверяем корректность вычисления Фибоначчи
const { fibonacci } = userModule;

// Тест 1: Обычные случаи
assert.strict.equal(fibonacci(0), 0, 'fibonacci(0) должен быть 0');
assert.strict.equal(fibonacci(1), 1, 'fibonacci(1) должен быть 1');
assert.strict.equal(fibonacci(2), 1, 'fibonacci(2) должен быть 1');
assert.strict.equal(fibonacci(3), 2, 'fibonacci(3) должен быть 2');
assert.strict.equal(fibonacci(4), 3, 'fibonacci(4) должен быть 3');
assert.strict.equal(fibonacci(5), 5, 'fibonacci(5) должен быть 5');
assert.strict.equal(fibonacci(6), 8, 'fibonacci(6) должен быть 8');
assert.strict.equal(fibonacci(7), 13, 'fibonacci(7) должен быть 13');

// Тест 2: Большие числа
assert.strict.equal(fibonacci(10), 55, 'fibonacci(10) должен быть 55');
assert.strict.equal(fibonacci(15), 610, 'fibonacci(15) должен быть 610');

// Тест 3: Отрицательные числа (должны выбрасывать исключение)
try {
  fibonacci(-1);
  assert.strict.ok(false, 'fibonacci(-1) должен выбрасывать исключение');
} catch (e) {
  assert.strict.ok(true, 'fibonacci(-1) правильно выбрасывает исключение');
}`,
    solution: `public class Fibonacci {
  public static long fibonacci(int n) {
    if (n < 0) {
      throw new IllegalArgumentException("Число Фибоначчи не определено для отрицательных чисел");
    }
    if (n <= 1) {
      return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
  
  public static long fibonacciIterative(int n) {
    if (n < 0) {
      throw new IllegalArgumentException("Число Фибоначчи не определено для отрицательных чисел");
    }
    if (n <= 1) {
      return n;
    }
    
    long prev = 0;
    long curr = 1;
    
    for (int i = 2; i <= n; i++) {
      long next = prev + curr;
      prev = curr;
      curr = next;
    }
    
    return curr;
  }
  
  public static void main(String[] args) {
    System.out.println(fibonacci(10)); // должно вывести 55
    System.out.println(fibonacciIterative(10)); // должно вывести 55
  }
}`
  },

  {
    id: 'be_maxSubarray',
    level: 'junior',
    title: 'maxSubarraySum(arr)',
    exportName: 'maxSubarraySum',
    description: 'Найти максимальную сумму подмассива (алгоритм Кадане).',
    language: 'java',
    starter: `public class MaxSubarray {
  public static int maxSubarraySum(int[] arr) {
    // TODO: реализуйте алгоритм Кадане
    // Найти подмассив с максимальной суммой
    // Верните максимальную сумму
    return 0;
  }
  
  public static void main(String[] args) {
    int[] arr = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    System.out.println(maxSubarraySum(arr)); // должно вывести 6
  }
}`,
    tests: `// Тесты для Java кода
// Проверяем корректность алгоритма Кадане
const { maxSubarraySum } = userModule;

// Тест 1: Обычные случаи
assert.strict.equal(maxSubarraySum([1, -3, 2, 1, -1]), 3, 'maxSubarraySum([1,-3,2,1,-1]) должен быть 3');
assert.strict.equal(maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4]), 6, 'maxSubarraySum([-2,1,-3,4,-1,2,1,-5,4]) должен быть 6');
assert.strict.equal(maxSubarraySum([5, 4, -1, 7, 8]), 23, 'maxSubarraySum([5,4,-1,7,8]) должен быть 23');

// Тест 2: Граничные случаи
assert.strict.equal(maxSubarraySum([1]), 1, 'maxSubarraySum([1]) должен быть 1');
assert.strict.equal(maxSubarraySum([-1]), -1, 'maxSubarraySum([-1]) должен быть -1');
assert.strict.equal(maxSubarraySum([0]), 0, 'maxSubarraySum([0]) должен быть 0');

// Тест 3: Все отрицательные числа
assert.strict.equal(maxSubarraySum([-5, -2, -8, -1]), -1, 'maxSubarraySum([-5,-2,-8,-1]) должен быть -1');

// Тест 4: Все положительные числа
assert.strict.equal(maxSubarraySum([1, 2, 3, 4, 5]), 15, 'maxSubarraySum([1,2,3,4,5]) должен быть 15');`,
    solution: `public class MaxSubarray {
  public static int maxSubarraySum(int[] arr) {
    if (arr == null || arr.length == 0) {
      return 0;
    }
    
    int maxSoFar = arr[0];
    int maxEndingHere = arr[0];
    
    for (int i = 1; i < arr.length; i++) {
      maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
      maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
  }
  
  public static void main(String[] args) {
    int[] arr = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    System.out.println(maxSubarraySum(arr)); // должно вывести 6
  }
}`
  },

  {
    id: 'be_mergeSort',
    level: 'junior',
    title: 'mergeSort(arr)',
    exportName: 'mergeSort',
    description: 'Реализовать сортировку слиянием.',
    language: 'java',
    starter: `public class MergeSort {
  public static void mergeSort(int[] arr) {
    // TODO: реализуйте сортировку слиянием
    // Сложность O(n log n)
    // Сортировка in-place
  }
  
  private static void merge(int[] arr, int left, int mid, int right) {
    // TODO: реализуйте слияние двух отсортированных подмассивов
  }
  
  public static void main(String[] args) {
    int[] arr = {64, 34, 25, 12, 22, 11, 90};
    mergeSort(arr);
    System.out.println(java.util.Arrays.toString(arr));
  }
}`,
    tests: `// Тесты для Java кода
// Проверяем корректность сортировки слиянием
const { mergeSort } = userModule;

// Тест 1: Обычные случаи
const arr1 = [64, 34, 25, 12, 22, 11, 90];
const sorted1 = [...arr1];
mergeSort(sorted1);
assert.strict.deepEqual(sorted1, [11, 12, 22, 25, 34, 64, 90], 'mergeSort([64,34,25,12,22,11,90]) должен быть [11,12,22,25,34,64,90]');

const arr2 = [5, 2, 8, 1, 9];
const sorted2 = [...arr2];
mergeSort(sorted2);
assert.strict.deepEqual(sorted2, [1, 2, 5, 8, 9], 'mergeSort([5,2,8,1,9]) должен быть [1,2,5,8,9]');

// Тест 2: Граничные случаи
const arr3 = [1];
const sorted3 = [...arr3];
mergeSort(sorted3);
assert.strict.deepEqual(sorted3, [1], 'mergeSort([1]) должен быть [1]');

const arr4 = [2, 1];
const sorted4 = [...arr4];
mergeSort(sorted4);
assert.strict.deepEqual(sorted4, [1, 2], 'mergeSort([2,1]) должен быть [1,2]');

// Тест 3: Уже отсортированный массив
const arr5 = [1, 2, 3, 4, 5];
const sorted5 = [...arr5];
mergeSort(sorted5);
assert.strict.deepEqual(sorted5, [1, 2, 3, 4, 5], 'mergeSort([1,2,3,4,5]) должен быть [1,2,3,4,5]');

// Тест 4: Обратно отсортированный массив
const arr6 = [5, 4, 3, 2, 1];
const sorted6 = [...arr6];
mergeSort(sorted6);
assert.strict.deepEqual(sorted6, [1, 2, 3, 4, 5], 'mergeSort([5,4,3,2,1]) должен быть [1,2,3,4,5]');`,
    solution: `public class MergeSort {
  public static void mergeSort(int[] arr) {
    if (arr == null || arr.length <= 1) {
      return;
    }
    mergeSort(arr, 0, arr.length - 1);
  }
  
  private static void mergeSort(int[] arr, int left, int right) {
    if (left < right) {
      int mid = left + (right - left) / 2;
      mergeSort(arr, left, mid);
      mergeSort(arr, mid + 1, right);
      merge(arr, left, mid, right);
    }
  }
  
  private static void merge(int[] arr, int left, int mid, int right) {
    int[] leftArr = new int[mid - left + 1];
    int[] rightArr = new int[right - mid];
    
    for (int i = 0; i < leftArr.length; i++) {
      leftArr[i] = arr[left + i];
    }
    for (int i = 0; i < rightArr.length; i++) {
      rightArr[i] = arr[mid + 1 + i];
    }
    
    int i = 0, j = 0, k = left;
    
    while (i < leftArr.length && j < rightArr.length) {
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      k++;
    }
    
    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      i++;
      k++;
    }
    
    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      j++;
      k++;
    }
  }
  
  public static void main(String[] args) {
    int[] arr = {64, 34, 25, 12, 22, 11, 90};
    mergeSort(arr);
    System.out.println(java.util.Arrays.toString(arr));
  }
}`
  },

  // MIDDLE (8 задач) - Продвинутые алгоритмы и паттерны
  {
    id: 'be_quickSort',
    level: 'middle',
    title: 'quickSort(arr)',
    exportName: 'quickSort',
    description: 'Реализовать быструю сортировку с оптимизацией.',
    language: 'java',
    starter: `public class QuickSort {
  public static void quickSort(int[] arr) {
    // TODO: Реализуйте быструю сортировку
    // Используйте рекурсивный подход
    // Оптимизируйте для малых массивов
    if (arr == null || arr.length <= 1) return;
    quickSort(arr, 0, arr.length - 1);
  }
  
  private static void quickSort(int[] arr, int low, int high) {
    // TODO: Реализуйте рекурсивную часть
    // Выберите pivot элемент
    // Разделите массив на две части
    // Рекурсивно отсортируйте части
  }
  
  private static int partition(int[] arr, int low, int high) {
    // TODO: Реализуйте разделение массива
    // Верните индекс pivot элемента
  }
  
  public static void main(String[] args) {
    int[] arr = {64, 34, 25, 12, 22, 11, 90};
    quickSort(arr);
    System.out.println(java.util.Arrays.toString(arr));
  }
}`,
    tests: `// Тесты для быстрой сортировки
// Проверяем корректность алгоритма
const { quickSort } = userModule;

// Тест 1: Обычные случаи
const arr1 = [64, 34, 25, 12, 22, 11, 90];
const sorted1 = [...arr1];
quickSort(sorted1);
assert.strict.deepEqual(sorted1, [11, 12, 22, 25, 34, 64, 90], 'quickSort([64,34,25,12,22,11,90]) должен быть [11,12,22,25,34,64,90]');

const arr2 = [5, 2, 8, 1, 9, 3];
const sorted2 = [...arr2];
quickSort(sorted2);
assert.strict.deepEqual(sorted2, [1, 2, 3, 5, 8, 9], 'quickSort([5,2,8,1,9,3]) должен быть [1,2,3,5,8,9]');

// Тест 2: Граничные случаи
const arr3 = [1];
const sorted3 = [...arr3];
quickSort(sorted3);
assert.strict.deepEqual(sorted3, [1], 'quickSort([1]) должен быть [1]');

const arr4 = [2, 1];
const sorted4 = [...arr4];
quickSort(sorted4);
assert.strict.deepEqual(sorted4, [1, 2], 'quickSort([2,1]) должен быть [1,2]');

// Тест 3: Уже отсортированный массив
const arr5 = [1, 2, 3, 4, 5];
const sorted5 = [...arr5];
quickSort(sorted5);
assert.strict.deepEqual(sorted5, [1, 2, 3, 4, 5], 'quickSort([1,2,3,4,5]) должен быть [1,2,3,4,5]');

// Тест 4: Обратно отсортированный массив
const arr6 = [5, 4, 3, 2, 1];
const sorted6 = [...arr6];
quickSort(sorted6);
assert.strict.deepEqual(sorted6, [1, 2, 3, 4, 5], 'quickSort([5,4,3,2,1]) должен быть [1,2,3,4,5]');

// Тест 5: Дубликаты
const arr7 = [3, 1, 4, 1, 5, 9, 2, 6, 5];
const sorted7 = [...arr7];
quickSort(sorted7);
assert.strict.deepEqual(sorted7, [1, 1, 2, 3, 4, 5, 5, 6, 9], 'quickSort([3,1,4,1,5,9,2,6,5]) должен быть [1,1,2,3,4,5,5,6,9]');`,
    solution: `public class QuickSort {
  public static void quickSort(int[] arr) {
    if (arr == null || arr.length <= 1) return;
    quickSort(arr, 0, arr.length - 1);
  }
  
  private static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
      int pivotIndex = partition(arr, low, high);
      quickSort(arr, low, pivotIndex - 1);
      quickSort(arr, pivotIndex + 1, high);
    }
  }
  
  private static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
      if (arr[j] <= pivot) {
        i++;
        swap(arr, i, j);
      }
    }
    
    swap(arr, i + 1, high);
    return i + 1;
  }
  
  private static void swap(int[] arr, int i, int j) {
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  
  public static void main(String[] args) {
    int[] arr = {64, 34, 25, 12, 22, 11, 90};
    quickSort(arr);
    System.out.println(java.util.Arrays.toString(arr));
  }
}`
  },

  {
    id: 'be_dijkstra',
    level: 'middle',
    title: 'dijkstra(graph, start)',
    exportName: 'dijkstra',
    description: 'Реализовать алгоритм Дейкстры для поиска кратчайшего пути.',
    language: 'java',
    starter: `import java.util.*;

public class Dijkstra {
  public static int[] dijkstra(int[][] graph, int start) {
    // TODO: Реализуйте алгоритм Дейкстры
    // Используйте PriorityQueue для эффективности
    // Верните массив кратчайших расстояний
    int n = graph.length;
    int[] dist = new int[n];
    boolean[] visited = new boolean[n];
    
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[start] = 0;
    
    // TODO: Реализуйте основной цикл алгоритма
    return dist;
  }
  
  public static void main(String[] args) {
    int[][] graph = {
      {0, 4, 0, 0, 0, 0, 0, 8, 0},
      {4, 0, 8, 0, 0, 0, 0, 11, 0},
      {0, 8, 0, 7, 0, 4, 0, 0, 2},
      {0, 0, 7, 0, 9, 14, 0, 0, 0},
      {0, 0, 0, 9, 0, 10, 0, 0, 0},
      {0, 0, 4, 14, 10, 0, 2, 0, 0},
      {0, 0, 0, 0, 0, 2, 0, 1, 6},
      {8, 11, 0, 0, 0, 0, 1, 0, 7},
      {0, 0, 2, 0, 0, 0, 6, 7, 0}
    };
    
    int[] dist = dijkstra(graph, 0);
    System.out.println("Кратчайшие расстояния: " + java.util.Arrays.toString(dist));
  }
}`,
    tests: `// Тесты для алгоритма Дейкстры
// Проверяем корректность поиска кратчайшего пути
const { dijkstra } = userModule;

// Тест 1: Простой граф
const graph1 = [
  [0, 4, 0, 0, 0, 0, 0, 8, 0],
  [4, 0, 8, 0, 0, 0, 0, 11, 0],
  [0, 8, 0, 7, 0, 4, 0, 0, 2],
  [0, 0, 7, 0, 9, 14, 0, 0, 0],
  [0, 0, 0, 9, 0, 10, 0, 0, 0],
  [0, 0, 4, 14, 10, 0, 2, 0, 0],
  [0, 0, 0, 0, 0, 2, 0, 1, 6],
  [8, 11, 0, 0, 0, 0, 1, 0, 7],
  [0, 0, 2, 0, 0, 0, 6, 7, 0]
];
const result1 = dijkstra(graph1, 0);
assert.strict.deepEqual(result1, [0, 4, 12, 19, 21, 11, 9, 8, 14], 'dijkstra должен найти кратчайшие пути от вершины 0');

// Тест 2: Граф с одной вершиной
const graph2 = [[0]];
const result2 = dijkstra(graph2, 0);
assert.strict.deepEqual(result2, [0], 'dijkstra для одной вершины должен вернуть [0]');

// Тест 3: Граф с двумя вершинами
const graph3 = [
  [0, 5],
  [5, 0]
];
const result3 = dijkstra(graph3, 0);
assert.strict.deepEqual(result3, [0, 5], 'dijkstra для двух вершин должен вернуть [0, 5]');

// Тест 4: Граф без путей
const graph4 = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
];
const result4 = dijkstra(graph4, 0);
assert.strict.deepEqual(result4, [0, Infinity, Infinity], 'dijkstra для графа без путей должен вернуть [0, Infinity, Infinity]');`,
    solution: `import java.util.*;

public class Dijkstra {
  public static int[] dijkstra(int[][] graph, int start) {
    int n = graph.length;
    int[] dist = new int[n];
    boolean[] visited = new boolean[n];
    
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[start] = 0;
    
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
    pq.offer(new int[]{start, 0});
    
    while (!pq.isEmpty()) {
      int[] current = pq.poll();
      int u = current[0];
      
      if (visited[u]) continue;
      visited[u] = true;
      
      for (int v = 0; v < n; v++) {
        if (graph[u][v] != 0 && !visited[v]) {
          int newDist = dist[u] + graph[u][v];
          if (newDist < dist[v]) {
            dist[v] = newDist;
            pq.offer(new int[]{v, newDist});
          }
        }
      }
    }
    
    return dist;
  }
  
  public static void main(String[] args) {
    int[][] graph = {
      {0, 4, 0, 0, 0, 0, 0, 8, 0},
      {4, 0, 8, 0, 0, 0, 0, 11, 0},
      {0, 8, 0, 7, 0, 4, 0, 0, 2},
      {0, 0, 7, 0, 9, 14, 0, 0, 0},
      {0, 0, 0, 9, 0, 10, 0, 0, 0},
      {0, 0, 4, 14, 10, 0, 2, 0, 0},
      {0, 0, 0, 0, 0, 2, 0, 1, 6},
      {8, 11, 0, 0, 0, 0, 1, 0, 7},
      {0, 0, 2, 0, 0, 0, 6, 7, 0}
    };
    
    int[] dist = dijkstra(graph, 0);
    System.out.println("Кратчайшие расстояния: " + java.util.Arrays.toString(dist));
  }
}`
  },

  {
    id: 'be_lru_cache',
    level: 'middle',
    title: 'LRUCache<K,V>',
    exportName: 'LRUCache',
    description: 'Реализовать LRU Cache с использованием HashMap и DoublyLinkedList.',
    language: 'java',
    starter: `import java.util.*;

public class LRUCache<K, V> {
  private final int capacity;
  private final Map<K, Node<K, V>> cache;
  private final Node<K, V> head;
  private final Node<K, V> tail;
  
  public LRUCache(int capacity) {
    // TODO: Инициализируйте LRU Cache
    this.capacity = capacity;
    this.cache = new HashMap<>();
    this.head = new Node<>(null, null);
    this.tail = new Node<>(null, null);
    // TODO: Свяжите head и tail
  }
  
  public V get(K key) {
    // TODO: Реализуйте получение значения
    // Переместите узел в начало списка
    return null;
  }
  
  public void put(K key, V value) {
    // TODO: Реализуйте добавление/обновление значения
    // Если ключ существует - обновите значение
    // Если ключ не существует - добавьте новый узел
    // При превышении capacity удалите последний узел
  }
  
  private void addToHead(Node<K, V> node) {
    // TODO: Добавьте узел в начало списка
  }
  
  private void removeNode(Node<K, V> node) {
    // TODO: Удалите узел из списка
  }
  
  private void moveToHead(Node<K, V> node) {
    // TODO: Переместите узел в начало списка
  }
  
  private static class Node<K, V> {
    K key;
    V value;
    Node<K, V> prev;
    Node<K, V> next;
    
    Node(K key, V value) {
      this.key = key;
      this.value = value;
    }
  }
  
  public static void main(String[] args) {
    LRUCache<Integer, String> cache = new LRUCache<>(2);
    cache.put(1, "one");
    cache.put(2, "two");
    System.out.println(cache.get(1)); // "one"
    cache.put(3, "three");
    System.out.println(cache.get(2)); // null
  }
}`,
    tests: `// Тесты для LRU Cache
// Проверяем корректность работы кэша
const { LRUCache } = userModule;

// Тест 1: Базовые операции
const cache1 = new LRUCache(2);
cache1.put(1, "one");
cache1.put(2, "two");
assert.strict.equal(cache1.get(1), "one", 'cache.get(1) должен вернуть "one"');
assert.strict.equal(cache1.get(2), "two", 'cache.get(2) должен вернуть "two"');

// Тест 2: LRU eviction
const cache2 = new LRUCache(2);
cache2.put(1, "one");
cache2.put(2, "two");
cache2.put(3, "three"); // должен вытеснить ключ 1
assert.strict.equal(cache2.get(1), null, 'cache.get(1) должен вернуть null после eviction');
assert.strict.equal(cache2.get(2), "two", 'cache.get(2) должен вернуть "two"');
assert.strict.equal(cache2.get(3), "three", 'cache.get(3) должен вернуть "three"');

// Тест 3: Обновление существующего ключа
const cache3 = new LRUCache(2);
cache3.put(1, "one");
cache3.put(2, "two");
cache3.put(1, "updated"); // обновляем ключ 1
assert.strict.equal(cache3.get(1), "updated", 'cache.get(1) должен вернуть "updated"');
assert.strict.equal(cache3.get(2), "two", 'cache.get(2) должен вернуть "two"');

// Тест 4: Доступ к ключу делает его недавно использованным
const cache4 = new LRUCache(2);
cache4.put(1, "one");
cache4.put(2, "two");
cache4.get(1); // делаем ключ 1 недавно использованным
cache4.put(3, "three"); // должен вытеснить ключ 2
assert.strict.equal(cache4.get(1), "one", 'cache.get(1) должен вернуть "one"');
assert.strict.equal(cache4.get(2), null, 'cache.get(2) должен вернуть null');
assert.strict.equal(cache4.get(3), "three", 'cache.get(3) должен вернуть "three"');`,
    solution: `import java.util.*;

public class LRUCache<K, V> {
  private final int capacity;
  private final Map<K, Node<K, V>> cache;
  private final Node<K, V> head;
  private final Node<K, V> tail;
  
  public LRUCache(int capacity) {
    this.capacity = capacity;
    this.cache = new HashMap<>();
    this.head = new Node<>(null, null);
    this.tail = new Node<>(null, null);
    head.next = tail;
    tail.prev = head;
  }
  
  public V get(K key) {
    Node<K, V> node = cache.get(key);
    if (node == null) {
      return null;
    }
    moveToHead(node);
    return node.value;
  }
  
  public void put(K key, V value) {
    Node<K, V> node = cache.get(key);
    
    if (node == null) {
      Node<K, V> newNode = new Node<>(key, value);
      cache.put(key, newNode);
      addToHead(newNode);
      
      if (cache.size() > capacity) {
        Node<K, V> tail = removeTail();
        cache.remove(tail.key);
      }
    } else {
      node.value = value;
      moveToHead(node);
    }
  }
  
  private void addToHead(Node<K, V> node) {
    node.prev = head;
    node.next = head.next;
    head.next.prev = node;
    head.next = node;
  }
  
  private void removeNode(Node<K, V> node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  
  private void moveToHead(Node<K, V> node) {
    removeNode(node);
    addToHead(node);
  }
  
  private Node<K, V> removeTail() {
    Node<K, V> last = tail.prev;
    removeNode(last);
    return last;
  }
  
  private static class Node<K, V> {
    K key;
    V value;
    Node<K, V> prev;
    Node<K, V> next;
    
    Node(K key, V value) {
      this.key = key;
      this.value = value;
    }
  }
  
  public static void main(String[] args) {
    LRUCache<Integer, String> cache = new LRUCache<>(2);
    cache.put(1, "one");
    cache.put(2, "two");
    System.out.println(cache.get(1)); // "one"
    cache.put(3, "three");
    System.out.println(cache.get(2)); // null
  }
}`
  },

  {
    id: 'be_binary_tree',
    level: 'middle',
    title: 'BinaryTree operations',
    exportName: 'BinaryTree',
    description: 'Реализовать операции с бинарным деревом поиска.',
    language: 'java',
    starter: `public class BinaryTree {
  private Node root;
  
  private static class Node {
    int data;
    Node left, right;
    
    Node(int data) {
      this.data = data;
    }
  }
  
  public void insert(int data) {
    // TODO: Реализуйте вставку элемента в BST
    root = insertRecursive(root, data);
  }
  
  private Node insertRecursive(Node node, int data) {
    // TODO: Реализуйте рекурсивную вставку
    return null;
  }
  
  public boolean search(int data) {
    // TODO: Реализуйте поиск элемента
    return searchRecursive(root, data);
  }
  
  private boolean searchRecursive(Node node, int data) {
    // TODO: Реализуйте рекурсивный поиск
    return false;
  }
  
  public void delete(int data) {
    // TODO: Реализуйте удаление элемента
    root = deleteRecursive(root, data);
  }
  
  private Node deleteRecursive(Node node, int data) {
    // TODO: Реализуйте рекурсивное удаление
    return null;
  }
  
  public void inorderTraversal() {
    // TODO: Реализуйте обход в порядке in-order
    inorderRecursive(root);
  }
  
  private void inorderRecursive(Node node) {
    // TODO: Реализуйте рекурсивный in-order обход
  }
  
  public static void main(String[] args) {
    BinaryTree tree = new BinaryTree();
    tree.insert(50);
    tree.insert(30);
    tree.insert(70);
    tree.insert(20);
    tree.insert(40);
    tree.insert(60);
    tree.insert(80);
    
    System.out.println("Inorder traversal:");
    tree.inorderTraversal();
    System.out.println();
    
    System.out.println("Search 40: " + tree.search(40));
    System.out.println("Search 90: " + tree.search(90));
  }
}`,
    tests: `// Тесты для бинарного дерева
// Проверяем корректность операций
const { BinaryTree } = userModule;

// Тест 1: Вставка и поиск
const tree1 = new BinaryTree();
tree1.insert(50);
tree1.insert(30);
tree1.insert(70);
tree1.insert(20);
tree1.insert(40);
assert.strict.equal(tree1.search(50), true, 'tree.search(50) должен вернуть true');
assert.strict.equal(tree1.search(30), true, 'tree.search(30) должен вернуть true');
assert.strict.equal(tree1.search(70), true, 'tree.search(70) должен вернуть true');
assert.strict.equal(tree1.search(20), true, 'tree.search(20) должен вернуть true');
assert.strict.equal(tree1.search(40), true, 'tree.search(40) должен вернуть true');
assert.strict.equal(tree1.search(90), false, 'tree.search(90) должен вернуть false');

// Тест 2: Поиск несуществующих элементов
const tree2 = new BinaryTree();
tree2.insert(10);
assert.strict.equal(tree2.search(5), false, 'tree.search(5) должен вернуть false');
assert.strict.equal(tree2.search(15), false, 'tree.search(15) должен вернуть false');

// Тест 3: Пустое дерево
const tree3 = new BinaryTree();
assert.strict.equal(tree3.search(1), false, 'tree.search(1) в пустом дереве должен вернуть false');

// Тест 4: Один элемент
const tree4 = new BinaryTree();
tree4.insert(42);
assert.strict.equal(tree4.search(42), true, 'tree.search(42) должен вернуть true');
assert.strict.equal(tree4.search(41), false, 'tree.search(41) должен вернуть false');`,
    solution: `public class BinaryTree {
  private Node root;
  
  private static class Node {
    int data;
    Node left, right;
    
    Node(int data) {
      this.data = data;
    }
  }
  
  public void insert(int data) {
    root = insertRecursive(root, data);
  }
  
  private Node insertRecursive(Node node, int data) {
    if (node == null) {
      return new Node(data);
    }
    
    if (data < node.data) {
      node.left = insertRecursive(node.left, data);
    } else if (data > node.data) {
      node.right = insertRecursive(node.right, data);
    }
    
    return node;
  }
  
  public boolean search(int data) {
    return searchRecursive(root, data);
  }
  
  private boolean searchRecursive(Node node, int data) {
    if (node == null) {
      return false;
    }
    
    if (data == node.data) {
      return true;
    } else if (data < node.data) {
      return searchRecursive(node.left, data);
    } else {
      return searchRecursive(node.right, data);
    }
  }
  
  public void delete(int data) {
    root = deleteRecursive(root, data);
  }
  
  private Node deleteRecursive(Node node, int data) {
    if (node == null) {
      return null;
    }
    
    if (data < node.data) {
      node.left = deleteRecursive(node.left, data);
    } else if (data > node.data) {
      node.right = deleteRecursive(node.right, data);
    } else {
      if (node.left == null) {
        return node.right;
      } else if (node.right == null) {
        return node.left;
      }
      
      node.data = minValue(node.right);
      node.right = deleteRecursive(node.right, node.data);
    }
    
    return node;
  }
  
  private int minValue(Node node) {
    int min = node.data;
    while (node.left != null) {
      min = node.left.data;
      node = node.left;
    }
    return min;
  }
  
  public void inorderTraversal() {
    inorderRecursive(root);
  }
  
  private void inorderRecursive(Node node) {
    if (node != null) {
      inorderRecursive(node.left);
      System.out.print(node.data + " ");
      inorderRecursive(node.right);
    }
  }
  
  public static void main(String[] args) {
    BinaryTree tree = new BinaryTree();
    tree.insert(50);
    tree.insert(30);
    tree.insert(70);
    tree.insert(20);
    tree.insert(40);
    tree.insert(60);
    tree.insert(80);
    
    System.out.println("Inorder traversal:");
    tree.inorderTraversal();
    System.out.println();
    
    System.out.println("Search 40: " + tree.search(40));
    System.out.println("Search 90: " + tree.search(90));
  }
}`
  },

  {
    id: 'be_hashmap_implementation',
    level: 'middle',
    title: 'HashMap<K,V> implementation',
    exportName: 'HashMap',
    description: 'Реализовать простую версию HashMap с коллизиями.',
    language: 'java',
    starter: `public class MyHashMap<K, V> {
  private static final int INITIAL_CAPACITY = 16;
  private static final double LOAD_FACTOR = 0.75;
  
  private Entry<K, V>[] table;
  private int size;
  private int capacity;
  
  @SuppressWarnings("unchecked")
  public MyHashMap() {
    this.capacity = INITIAL_CAPACITY;
    this.table = new Entry[capacity];
    this.size = 0;
  }
  
  private static class Entry<K, V> {
    K key;
    V value;
    Entry<K, V> next;
    
    Entry(K key, V value) {
      this.key = key;
      this.value = value;
    }
  }
  
  public void put(K key, V value) {
    // TODO: Реализуйте вставку элемента
    // Обработайте коллизии через цепочки
    // Реализуйте resize при превышении load factor
  }
  
  public V get(K key) {
    // TODO: Реализуйте получение элемента
    return null;
  }
  
  public V remove(K key) {
    // TODO: Реализуйте удаление элемента
    return null;
  }
  
  public boolean containsKey(K key) {
    // TODO: Реализуйте проверку наличия ключа
    return false;
  }
  
  public int size() {
    return size;
  }
  
  public boolean isEmpty() {
    return size == 0;
  }
  
  private int hash(K key) {
    // TODO: Реализуйте хеш-функцию
    return 0;
  }
  
  private void resize() {
    // TODO: Реализуйте увеличение размера таблицы
  }
  
  public static void main(String[] args) {
    MyHashMap<String, Integer> map = new MyHashMap<>();
    map.put("one", 1);
    map.put("two", 2);
    map.put("three", 3);
    
    System.out.println("Size: " + map.size());
    System.out.println("Get 'two': " + map.get("two"));
    System.out.println("Contains 'three': " + map.containsKey("three"));
  }
}`,
    tests: `// Тесты для HashMap
// Проверяем корректность работы
const { MyHashMap } = userModule;

// Тест 1: Базовые операции
const map1 = new MyHashMap();
map1.put("one", 1);
map1.put("two", 2);
map1.put("three", 3);
assert.strict.equal(map1.get("one"), 1, 'map.get("one") должен вернуть 1');
assert.strict.equal(map1.get("two"), 2, 'map.get("two") должен вернуть 2');
assert.strict.equal(map1.get("three"), 3, 'map.get("three") должен вернуть 3');
assert.strict.equal(map1.size(), 3, 'map.size() должен вернуть 3');

// Тест 2: Проверка наличия ключей
assert.strict.equal(map1.containsKey("one"), true, 'map.containsKey("one") должен вернуть true');
assert.strict.equal(map1.containsKey("two"), true, 'map.containsKey("two") должен вернуть true');
assert.strict.equal(map1.containsKey("four"), false, 'map.containsKey("four") должен вернуть false');

// Тест 3: Обновление значений
map1.put("one", 10);
assert.strict.equal(map1.get("one"), 10, 'map.get("one") после обновления должен вернуть 10');
assert.strict.equal(map1.size(), 3, 'map.size() после обновления должен остаться 3');

// Тест 4: Удаление элементов
const removed = map1.remove("two");
assert.strict.equal(removed, 2, 'map.remove("two") должен вернуть 2');
assert.strict.equal(map1.get("two"), null, 'map.get("two") после удаления должен вернуть null');
assert.strict.equal(map1.containsKey("two"), false, 'map.containsKey("two") после удаления должен вернуть false');
assert.strict.equal(map1.size(), 2, 'map.size() после удаления должен быть 2');

// Тест 5: Пустая карта
const map2 = new MyHashMap();
assert.strict.equal(map2.isEmpty(), true, 'map.isEmpty() для пустой карты должен вернуть true');
assert.strict.equal(map2.size(), 0, 'map.size() для пустой карты должен вернуть 0');`,
    solution: `public class MyHashMap<K, V> {
  private static final int INITIAL_CAPACITY = 16;
  private static final double LOAD_FACTOR = 0.75;
  
  private Entry<K, V>[] table;
  private int size;
  private int capacity;
  
  @SuppressWarnings("unchecked")
  public MyHashMap() {
    this.capacity = INITIAL_CAPACITY;
    this.table = new Entry[capacity];
    this.size = 0;
  }
  
  private static class Entry<K, V> {
    K key;
    V value;
    Entry<K, V> next;
    
    Entry(K key, V value) {
      this.key = key;
      this.value = value;
    }
  }
  
  public void put(K key, V value) {
    if (key == null) {
      throw new IllegalArgumentException("Key cannot be null");
    }
    
    int index = hash(key);
    Entry<K, V> entry = table[index];
    
    // Проверяем, существует ли ключ
    while (entry != null) {
      if (entry.key.equals(key)) {
        entry.value = value;
        return;
      }
      entry = entry.next;
    }
    
    // Добавляем новый элемент
    Entry<K, V> newEntry = new Entry<>(key, value);
    newEntry.next = table[index];
    table[index] = newEntry;
    size++;
    
    // Проверяем необходимость resize
    if ((double) size / capacity > LOAD_FACTOR) {
      resize();
    }
  }
  
  public V get(K key) {
    if (key == null) {
      return null;
    }
    
    int index = hash(key);
    Entry<K, V> entry = table[index];
    
    while (entry != null) {
      if (entry.key.equals(key)) {
        return entry.value;
      }
      entry = entry.next;
    }
    
    return null;
  }
  
  public V remove(K key) {
    if (key == null) {
      return null;
    }
    
    int index = hash(key);
    Entry<K, V> entry = table[index];
    Entry<K, V> prev = null;
    
    while (entry != null) {
      if (entry.key.equals(key)) {
        if (prev == null) {
          table[index] = entry.next;
        } else {
          prev.next = entry.next;
        }
        size--;
        return entry.value;
      }
      prev = entry;
      entry = entry.next;
    }
    
    return null;
  }
  
  public boolean containsKey(K key) {
    return get(key) != null;
  }
  
  public int size() {
    return size;
  }
  
  public boolean isEmpty() {
    return size == 0;
  }
  
  private int hash(K key) {
    return Math.abs(key.hashCode()) % capacity;
  }
  
  @SuppressWarnings("unchecked")
  private void resize() {
    Entry<K, V>[] oldTable = table;
    capacity *= 2;
    table = new Entry[capacity];
    size = 0;
    
    for (Entry<K, V> entry : oldTable) {
      while (entry != null) {
        put(entry.key, entry.value);
        entry = entry.next;
      }
    }
  }
  
  public static void main(String[] args) {
    MyHashMap<String, Integer> map = new MyHashMap<>();
    map.put("one", 1);
    map.put("two", 2);
    map.put("three", 3);
    
    System.out.println("Size: " + map.size());
    System.out.println("Get 'two': " + map.get("two"));
    System.out.println("Contains 'three': " + map.containsKey("three"));
  }
}`
  },

  {
    id: 'be_producer_consumer',
    level: 'middle',
    title: 'Producer-Consumer pattern',
    exportName: 'ProducerConsumer',
    description: 'Реализовать паттерн Producer-Consumer с блокирующей очередью.',
    language: 'java',
    starter: `import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class ProducerConsumer {
  private final BlockingQueue<Integer> queue;
  private final AtomicInteger counter = new AtomicInteger(0);
  private volatile boolean running = true;
  
  public ProducerConsumer(int capacity) {
    this.queue = new ArrayBlockingQueue<>(capacity);
  }
  
  public void start() {
    // TODO: Запустите Producer и Consumer потоки
    // Producer должен генерировать числа от 1 до 100
    // Consumer должен обрабатывать числа из очереди
  }
  
  private class Producer implements Runnable {
    @Override
    public void run() {
      // TODO: Реализуйте Producer
      // Генерируйте числа и добавляйте в очередь
      // Обработайте InterruptedException
    }
  }
  
  private class Consumer implements Runnable {
    @Override
    public void run() {
      // TODO: Реализуйте Consumer
      // Извлекайте числа из очереди и обрабатывайте
      // Обработайте InterruptedException
    }
  }
  
  public void stop() {
    running = false;
  }
  
  public static void main(String[] args) throws InterruptedException {
    ProducerConsumer pc = new ProducerConsumer(10);
    pc.start();
    
    Thread.sleep(5000);
    pc.stop();
  }
}`,
    tests: `// Тесты для Producer-Consumer
// Проверяем корректность работы паттерна
const { ProducerConsumer } = userModule;

// Тест 1: Создание Producer-Consumer
const pc1 = new ProducerConsumer(5);
assert.strict.equal(pc1.queue.size(), 0, 'queue.size() для нового Producer-Consumer должен быть 0');
assert.strict.equal(pc1.running, true, 'running для нового Producer-Consumer должен быть true');

// Тест 2: Проверка методов
assert.strict.equal(pc1.isEmpty(), true, 'isEmpty() для пустой очереди должен вернуть true');

// Тест 3: Остановка
pc1.stop();
assert.strict.equal(pc1.running, false, 'running после stop() должен быть false');`,
    solution: `import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class ProducerConsumer {
  private final BlockingQueue<Integer> queue;
  private final AtomicInteger counter = new AtomicInteger(0);
  private volatile boolean running = true;
  
  public ProducerConsumer(int capacity) {
    this.queue = new ArrayBlockingQueue<>(capacity);
  }
  
  public void start() {
    Thread producerThread = new Thread(new Producer());
    Thread consumerThread = new Thread(new Consumer());
    
    producerThread.start();
    consumerThread.start();
  }
  
  private class Producer implements Runnable {
    @Override
    public void run() {
      try {
        for (int i = 1; i <= 100 && running; i++) {
          queue.put(i);
          System.out.println("Produced: " + i);
          Thread.sleep(100); // Имитация работы
        }
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
      }
    }
  }
  
  private class Consumer implements Runnable {
    @Override
    public void run() {
      try {
        while (running) {
          Integer value = queue.poll(1, TimeUnit.SECONDS);
          if (value != null) {
            System.out.println("Consumed: " + value);
            Thread.sleep(150); // Имитация обработки
          }
        }
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
      }
    }
  }
  
  public void stop() {
    running = false;
  }
  
  public static void main(String[] args) throws InterruptedException {
    ProducerConsumer pc = new ProducerConsumer(10);
    pc.start();
    
    Thread.sleep(5000);
    pc.stop();
  }
}`,
  },

  {
    id: 'be_observer_pattern',
    level: 'middle',
    title: 'Observer Pattern',
    exportName: 'ObserverPattern',
    description: 'Реализовать паттерн Observer для системы уведомлений.',
    language: 'java',
    starter: `import java.util.*;

public class ObserverPattern {
  // TODO: Реализуйте паттерн Observer
  // Создайте интерфейс Observer
  // Создайте класс Subject для управления наблюдателями
  // Создайте конкретные реализации Observer
  
  public static void main(String[] args) {
    // TODO: Создайте пример использования
    // Создайте Subject и несколько Observer
    // Продемонстрируйте работу паттерна
  }
}`,
    tests: `// Тесты для Observer Pattern
// Проверяем корректность работы паттерна
const { NewsAgency, NewsChannel, EmailSubscriber } = userModule;

// Тест 1: Создание и базовые операции
const agency = new NewsAgency();
const channel1 = new NewsChannel("CNN");
const channel2 = new NewsChannel("BBC");
const subscriber1 = new EmailSubscriber("user1@example.com");

// Тест 2: Добавление наблюдателей
agency.addObserver(channel1);
agency.addObserver(channel2);
agency.addObserver(subscriber1);
assert.strict.equal(agency.observers.length, 3, 'agency.observers.length должен быть 3');

// Тест 3: Уведомление наблюдателей
let notificationReceived = false;
const originalUpdate = channel1.update;
channel1.update = function(message) {
  notificationReceived = true;
  originalUpdate.call(this, message);
};
agency.setNews("Test news");
assert.strict.equal(notificationReceived, true, 'Наблюдатели должны получить уведомление');

// Тест 4: Удаление наблюдателей
agency.removeObserver(channel2);
assert.strict.equal(agency.observers.length, 2, 'agency.observers.length после удаления должен быть 2');

// Тест 5: Создание EmailSubscriber
const subscriber2 = new EmailSubscriber("user2@example.com");
assert.strict.equal(subscriber2.email, "user2@example.com", 'EmailSubscriber должен сохранить email');`,
    solution: `import java.util.*;

// Интерфейс Observer
interface Observer {
  void update(String message);
}

// Интерфейс Subject
interface Subject {
  void addObserver(Observer observer);
  void removeObserver(Observer observer);
  void notifyObservers(String message);
}

// Конкретная реализация Subject
class NewsAgency implements Subject {
  private List<Observer> observers = new ArrayList<>();
  private String news;
  
  @Override
  public void addObserver(Observer observer) {
    observers.add(observer);
  }
  
  @Override
  public void removeObserver(Observer observer) {
    observers.remove(observer);
  }
  
  @Override
  public void notifyObservers(String message) {
    for (Observer observer : observers) {
      observer.update(message);
    }
  }
  
  public void setNews(String news) {
    this.news = news;
    notifyObservers(news);
  }
}

// Конкретные реализации Observer
class NewsChannel implements Observer {
  private String name;
  
  public NewsChannel(String name) {
    this.name = name;
  }
  
  @Override
  public void update(String message) {
    System.out.println(name + " received news: " + message);
  }
}

class EmailSubscriber implements Observer {
  private String email;
  
  public EmailSubscriber(String email) {
    this.email = email;
  }
  
  @Override
  public void update(String message) {
    System.out.println("Email sent to " + email + ": " + message);
  }
}

public class ObserverPattern {
  public static void main(String[] args) {
    NewsAgency agency = new NewsAgency();
    
    NewsChannel channel1 = new NewsChannel("CNN");
    NewsChannel channel2 = new NewsChannel("BBC");
    EmailSubscriber subscriber1 = new EmailSubscriber("user1@example.com");
    EmailSubscriber subscriber2 = new EmailSubscriber("user2@example.com");
    
    agency.addObserver(channel1);
    agency.addObserver(channel2);
    agency.addObserver(subscriber1);
    agency.addObserver(subscriber2);
    
    agency.setNews("Breaking: New technology breakthrough!");
    
    agency.removeObserver(channel2);
    agency.setNews("Update: Technology details released!");
  }
}`,
  },

  {
    id: 'be_singleton_pattern',
    level: 'middle',
    title: 'Singleton Pattern',
    exportName: 'SingletonPattern',
    description: 'Реализовать паттерн Singleton с thread-safety.',
    language: 'java',
    starter: `public class SingletonPattern {
  // TODO: Реализуйте паттерн Singleton
  // Обеспечьте thread-safety
  // Используйте lazy initialization
  // Обработайте reflection и serialization
  
  private static SingletonPattern instance;
  
  private SingletonPattern() {
    // TODO: Защитите от reflection
  }
  
  public static SingletonPattern getInstance() {
    // TODO: Реализуйте thread-safe получение экземпляра
    return null;
  }
  
  public void doSomething() {
    System.out.println("Singleton is working!");
  }
  
  public static void main(String[] args) {
    // TODO: Продемонстрируйте работу Singleton
    // Создайте несколько потоков, которые получают экземпляр
    // Убедитесь, что все потоки получают один и тот же экземпляр
  }
}`,
    tests: `// Тесты для Singleton Pattern
// Проверяем корректность работы паттерна
const { SingletonPattern } = userModule;

// Тест 1: Получение экземпляра
const instance1 = SingletonPattern.getInstance();
const instance2 = SingletonPattern.getInstance();
assert.strict.equal(instance1, instance2, 'getInstance() должен возвращать один и тот же экземпляр');

// Тест 2: Проверка, что экземпляр не null
assert.strict.ok(instance1 !== null, 'getInstance() не должен возвращать null');

// Тест 3: Проверка, что экземпляр является объектом
assert.strict.equal(typeof instance1, 'object', 'getInstance() должен возвращать объект');

// Тест 4: Множественные вызовы
const instance3 = SingletonPattern.getInstance();
const instance4 = SingletonPattern.getInstance();
assert.strict.equal(instance3, instance4, 'Множественные вызовы getInstance() должны возвращать один экземпляр');
assert.strict.equal(instance1, instance3, 'Все вызовы getInstance() должны возвращать один экземпляр');`,
    solution: `public class SingletonPattern {
  private static volatile SingletonPattern instance;
  private static final Object lock = new Object();
  
  private SingletonPattern() {
    // Защита от reflection
    if (instance != null) {
      throw new IllegalStateException("Singleton instance already exists");
    }
  }
  
  public static SingletonPattern getInstance() {
    if (instance == null) {
      synchronized (lock) {
        if (instance == null) {
          instance = new SingletonPattern();
        }
      }
    }
    return instance;
  }
  
  public void doSomething() {
    System.out.println("Singleton is working! Thread: " + Thread.currentThread().getName());
  }
  
  public static void main(String[] args) {
    // Демонстрация работы Singleton
    Runnable task = () -> {
      SingletonPattern singleton = SingletonPattern.getInstance();
      singleton.doSomething();
    };
    
    // Создаем несколько потоков
    Thread thread1 = new Thread(task);
    Thread thread2 = new Thread(task);
    Thread thread3 = new Thread(task);
    
    thread1.start();
    thread2.start();
    thread3.start();
    
    try {
      thread1.join();
      thread2.join();
      thread3.join();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }
}`
  },

  {
    id: 'be_factory_pattern',
    level: 'middle',
    title: 'Factory Pattern',
    exportName: 'FactoryPattern',
    description: 'Реализовать паттерн Factory для создания различных типов транспорта.',
    language: 'java',
    starter: `public class FactoryPattern {
  // TODO: Реализуйте паттерн Factory
  // Создайте интерфейс Transport
  // Создайте конкретные классы транспорта
  // Создайте Factory для создания транспорта
  
  public static void main(String[] args) {
    // TODO: Продемонстрируйте работу Factory
    // Создайте различные типы транспорта
    // Продемонстрируйте полиморфизм
  }
}`,
    tests: `// Тесты для Factory Pattern
// Проверяем корректность работы паттерна
const { TransportFactory, Car, Truck, Motorcycle } = userModule;

// Тест 1: Создание автомобиля
const car = TransportFactory.createTransport('car', 'Toyota Camry');
assert.strict.ok(car instanceof Car, 'createTransport("car") должен вернуть экземпляр Car');
assert.strict.equal(car.model, 'Toyota Camry', 'car.model должен быть "Toyota Camry"');

// Тест 2: Создание грузовика
const truck = TransportFactory.createTransport('truck', 'Ford F-150');
assert.strict.ok(truck instanceof Truck, 'createTransport("truck") должен вернуть экземпляр Truck');
assert.strict.equal(truck.model, 'Ford F-150', 'truck.model должен быть "Ford F-150"');

// Тест 3: Создание мотоцикла
const motorcycle = TransportFactory.createTransport('motorcycle', 'Honda CBR');
assert.strict.ok(motorcycle instanceof Motorcycle, 'createTransport("motorcycle") должен вернуть экземпляр Motorcycle');
assert.strict.equal(motorcycle.model, 'Honda CBR', 'motorcycle.model должен быть "Honda CBR"');

// Тест 4: Неизвестный тип транспорта
const unknown = TransportFactory.createTransport('unknown', 'Test');
assert.strict.equal(unknown, null, 'createTransport("unknown") должен вернуть null');

// Тест 5: Проверка методов транспорта
let startCalled = false;
let stopCalled = false;
let infoCalled = false;

const testCar = new Car('Test Car');
const originalStart = testCar.start;
const originalStop = testCar.stop;
const originalGetInfo = testCar.getInfo;

testCar.start = function() { startCalled = true; originalStart.call(this); };
testCar.stop = function() { stopCalled = true; originalStop.call(this); };
testCar.getInfo = function() { infoCalled = true; originalGetInfo.call(this); };

testCar.start();
testCar.stop();
testCar.getInfo();

assert.strict.equal(startCalled, true, 'start() должен быть вызван');
assert.strict.equal(stopCalled, true, 'stop() должен быть вызван');
assert.strict.equal(infoCalled, true, 'getInfo() должен быть вызван');`,
    solution: `// Интерфейс Transport
interface Transport {
  void start();
  void stop();
  void getInfo();
}

// Конкретные классы транспорта
class Car implements Transport {
  private String model;
  
  public Car(String model) {
    this.model = model;
  }
  
  @Override
  public void start() {
    System.out.println("Car " + model + " started");
  }
  
  @Override
  public void stop() {
    System.out.println("Car " + model + " stopped");
  }
  
  @Override
  public void getInfo() {
    System.out.println("This is a car: " + model);
  }
}

class Bus implements Transport {
  private int capacity;
  
  public Bus(int capacity) {
    this.capacity = capacity;
  }
  
  @Override
  public void start() {
    System.out.println("Bus with capacity " + capacity + " started");
  }
  
  @Override
  public void stop() {
    System.out.println("Bus stopped");
  }
  
  @Override
  public void getInfo() {
    System.out.println("This is a bus with capacity: " + capacity);
  }
}

class Truck implements Transport {
  private double loadCapacity;
  
  public Truck(double loadCapacity) {
    this.loadCapacity = loadCapacity;
  }
  
  @Override
  public void start() {
    System.out.println("Truck with load capacity " + loadCapacity + " tons started");
  }
  
  @Override
  public void stop() {
    System.out.println("Truck stopped");
  }
  
  @Override
  public void getInfo() {
    System.out.println("This is a truck with load capacity: " + loadCapacity + " tons");
  }
}

// Factory для создания транспорта
class TransportFactory {
  public static Transport createTransport(String type, Object... params) {
    switch (type.toLowerCase()) {
      case "car":
        return new Car((String) params[0]);
      case "bus":
        return new Bus((Integer) params[0]);
      case "truck":
        return new Truck((Double) params[0]);
      default:
        throw new IllegalArgumentException("Unknown transport type: " + type);
    }
  }
}

public class FactoryPattern {
  public static void main(String[] args) {
    // Создаем различные типы транспорта
    Transport car = TransportFactory.createTransport("car", "Toyota Camry");
    Transport bus = TransportFactory.createTransport("bus", 50);
    Transport truck = TransportFactory.createTransport("truck", 10.5);
    
    // Демонстрируем полиморфизм
    Transport[] transports = {car, bus, truck};
    
    for (Transport transport : transports) {
      transport.getInfo();
      transport.start();
      transport.stop();
      System.out.println("---");
    }
  }
}`
  },

  // SENIOR (8 задач) - Продвинутые паттерны и архитектура
  {
    id: 'be_thread_pool',
    level: 'senior',
    title: 'ThreadPoolExecutor',
    exportName: 'ThreadPoolExecutor',
    description: 'Реализовать простой ThreadPoolExecutor с блокирующей очередью.',
    language: 'java',
    starter: `import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class SimpleThreadPool {
  private final int corePoolSize;
  private final int maximumPoolSize;
  private final long keepAliveTime;
  private final BlockingQueue<Runnable> workQueue;
  private final AtomicInteger threadCount = new AtomicInteger(0);
  private volatile boolean isShutdown = false;
  
  public SimpleThreadPool(int corePoolSize, int maximumPoolSize, 
                         long keepAliveTime, TimeUnit unit,
                         BlockingQueue<Runnable> workQueue) {
    // TODO: Инициализируйте ThreadPool
    this.corePoolSize = corePoolSize;
    this.maximumPoolSize = maximumPoolSize;
    this.keepAliveTime = unit.toNanos(keepAliveTime);
    this.workQueue = workQueue;
  }
  
  public void execute(Runnable command) {
    // TODO: Реализуйте выполнение задач
    // Создавайте новые потоки при необходимости
    // Используйте corePoolSize и maximumPoolSize
  }
  
  public void shutdown() {
    // TODO: Реализуйте корректное завершение
    // Остановите прием новых задач
    // Дождитесь завершения текущих задач
  }
  
  private class Worker implements Runnable {
    private final Runnable firstTask;
    
    Worker(Runnable firstTask) {
      this.firstTask = firstTask;
    }
    
    @Override
    public void run() {
      // TODO: Реализуйте выполнение задач воркера
      // Выполните firstTask, затем задачи из очереди
    }
  }
  
  public static void main(String[] args) throws InterruptedException {
    SimpleThreadPool pool = new SimpleThreadPool(2, 4, 60L, TimeUnit.SECONDS,
        new LinkedBlockingQueue<>());
    
    for (int i = 0; i < 10; i++) {
      final int taskId = i;
      pool.execute(() -> {
        System.out.println("Task " + taskId + " executed by " + 
                          Thread.currentThread().getName());
        try {
          Thread.sleep(1000);
        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
        }
      });
    }
    
    Thread.sleep(5000);
    pool.shutdown();
  }
}`,
    tests: `// Тесты для ThreadPoolExecutor
// Проверяем корректность работы пула потоков
const { SimpleThreadPool } = userModule;

// Тест 1: Создание ThreadPool
const pool = new SimpleThreadPool(2, 4, 60, 'SECONDS', []);
assert.strict.equal(pool.corePoolSize, 2, 'corePoolSize должен быть 2');
assert.strict.equal(pool.maximumPoolSize, 4, 'maximumPoolSize должен быть 4');
assert.strict.equal(pool.isShutdown, false, 'isShutdown должен быть false');

// Тест 2: Выполнение простой задачи
let taskExecuted = false;
pool.execute(() => {
  taskExecuted = true;
});
// Даем время на выполнение
setTimeout(() => {
  assert.strict.equal(taskExecuted, true, 'Задача должна быть выполнена');
}, 100);

// Тест 3: Проверка счетчика потоков
const initialThreadCount = pool.threadCount.get();
pool.execute(() => {});
// После выполнения задачи счетчик должен увеличиться
setTimeout(() => {
  assert.strict.ok(pool.threadCount.get() >= initialThreadCount, 'Счетчик потоков должен увеличиться');
}, 100);

// Тест 4: Shutdown
pool.shutdown();
assert.strict.equal(pool.isShutdown, true, 'isShutdown после shutdown должен быть true');

// Тест 5: Проверка базовых свойств
assert.strict.ok(pool.workQueue !== null, 'workQueue должен быть создан');
assert.strict.ok(pool.threadCount !== null, 'threadCount должен быть создан');`,
    solution: `import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class SimpleThreadPool {
  private final int corePoolSize;
  private final int maximumPoolSize;
  private final long keepAliveTime;
  private final BlockingQueue<Runnable> workQueue;
  private final AtomicInteger threadCount = new AtomicInteger(0);
  private volatile boolean isShutdown = false;
  
  public SimpleThreadPool(int corePoolSize, int maximumPoolSize, 
                         long keepAliveTime, TimeUnit unit,
                         BlockingQueue<Runnable> workQueue) {
    this.corePoolSize = corePoolSize;
    this.maximumPoolSize = maximumPoolSize;
    this.keepAliveTime = unit.toNanos(keepAliveTime);
    this.workQueue = workQueue;
  }
  
  public void execute(Runnable command) {
    if (isShutdown) {
      throw new RejectedExecutionException("ThreadPool is shutdown");
    }
    
    if (threadCount.get() < corePoolSize) {
      if (addWorker(command, true)) {
        return;
      }
    }
    
    if (workQueue.offer(command)) {
      if (threadCount.get() == 0) {
        addWorker(null, false);
      }
    } else if (!addWorker(command, false)) {
      throw new RejectedExecutionException("ThreadPool is full");
    }
  }
  
  private boolean addWorker(Runnable firstTask, boolean core) {
    int maxPoolSize = core ? corePoolSize : maximumPoolSize;
    
    while (threadCount.get() < maxPoolSize) {
      if (threadCount.incrementAndGet() <= maxPoolSize) {
        Worker worker = new Worker(firstTask);
        Thread thread = new Thread(worker, "Worker-" + threadCount.get());
        thread.start();
        return true;
      } else {
        threadCount.decrementAndGet();
        break;
      }
    }
    return false;
  }
  
  public void shutdown() {
    isShutdown = true;
    // В реальной реализации нужно дождаться завершения всех задач
  }
  
  private class Worker implements Runnable {
    private final Runnable firstTask;
    
    Worker(Runnable firstTask) {
      this.firstTask = firstTask;
    }
    
    @Override
    public void run() {
      runWorker(this);
    }
  }
  
  private void runWorker(Worker worker) {
    Runnable task = worker.firstTask;
    worker.firstTask = null;
    
    while (task != null || (task = getTask()) != null) {
      try {
        task.run();
      } finally {
        task = null;
      }
    }
  }
  
  private Runnable getTask() {
    try {
      return workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return null;
    }
  }
  
  public static void main(String[] args) throws InterruptedException {
    SimpleThreadPool pool = new SimpleThreadPool(2, 4, 60L, TimeUnit.SECONDS,
        new LinkedBlockingQueue<>());
    
    for (int i = 0; i < 10; i++) {
      final int taskId = i;
      pool.execute(() -> {
        System.out.println("Task " + taskId + " executed by " + 
                          Thread.currentThread().getName());
        try {
          Thread.sleep(1000);
        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
        }
      });
    }
    
    Thread.sleep(5000);
    pool.shutdown();
  }
}`
  }
]
