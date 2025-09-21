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
// Проверяем корректность алгоритма twoSum`,
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
// Проверяем корректность вычисления факториала`,
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
// Проверяем корректность проверки палиндрома`,
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
// Проверяем корректность бинарного поиска`,
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
// Проверяем корректность переворота строки`,
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
// Проверяем корректность вычисления Фибоначчи`,
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
// Проверяем корректность алгоритма Кадане`,
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
// Проверяем корректность сортировки слиянием`,
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
// Проверяем корректность алгоритма`,
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
// Проверяем корректность поиска кратчайшего пути`,
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
// Проверяем корректность работы кэша`,
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
// Проверяем корректность операций`,
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
// Проверяем корректность работы`,
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
// Проверяем корректность работы паттерна`,
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
}`
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
// Проверяем корректность работы паттерна`,
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
}`
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
// Проверяем корректность работы паттерна`,
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
// Проверяем корректность работы паттерна`,
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
// Проверяем корректность работы пула потоков`,
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
