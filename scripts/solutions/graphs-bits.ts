import type { SolutionSet } from './index'

/** Reference solutions for `src/data/problems/graphs-bits.ts`. */
export const GRAPH_SOLUTIONS: Record<string, SolutionSet> = {
  'cp-gr-land-blocks': {
    python: `from typing import List
from collections import deque

class Solution:
    def countLandBlocks(self, field: List[List[int]]) -> int:
        if not field or not field[0]:
            return 0
        rows, cols = len(field), len(field[0])
        visited = [[False] * cols for _ in range(rows)]
        count = 0
        for r in range(rows):
            for c in range(cols):
                if field[r][c] == 1 and not visited[r][c]:
                    count += 1
                    visited[r][c] = True
                    q = deque([(r, c)])
                    while q:
                        cr, cc = q.popleft()
                        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                            nr, nc = cr + dr, cc + dc
                            if 0 <= nr < rows and 0 <= nc < cols and field[nr][nc] == 1 and not visited[nr][nc]:
                                visited[nr][nc] = True
                                q.append((nr, nc))
        return count
`,
    cpp: `class Solution {
public:
    int countLandBlocks(vector<vector<int>>& field) {
        if (field.empty() || field[0].empty()) return 0;
        int rows = field.size(), cols = field[0].size();
        vector<vector<bool>> visited(rows, vector<bool>(cols, false));
        int count = 0;
        int dr[4] = {1, -1, 0, 0};
        int dc[4] = {0, 0, 1, -1};
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (field[r][c] == 1 && !visited[r][c]) {
                    count++;
                    visited[r][c] = true;
                    queue<pair<int, int>> q;
                    q.push({r, c});
                    while (!q.empty()) {
                        auto [cr, cc] = q.front();
                        q.pop();
                        for (int k = 0; k < 4; k++) {
                            int nr = cr + dr[k], nc = cc + dc[k];
                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && field[nr][nc] == 1 && !visited[nr][nc]) {
                                visited[nr][nc] = true;
                                q.push({nr, nc});
                            }
                        }
                    }
                }
            }
        }
        return count;
    }
};
`,
    java: `class Solution {
    public int countLandBlocks(int[][] field) {
        if (field.length == 0 || field[0].length == 0) return 0;
        int rows = field.length, cols = field[0].length;
        boolean[][] visited = new boolean[rows][cols];
        int count = 0;
        int[] dr = {1, -1, 0, 0};
        int[] dc = {0, 0, 1, -1};
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (field[r][c] == 1 && !visited[r][c]) {
                    count++;
                    visited[r][c] = true;
                    ArrayDeque<int[]> q = new ArrayDeque<>();
                    q.add(new int[]{r, c});
                    while (!q.isEmpty()) {
                        int[] cur = q.poll();
                        for (int k = 0; k < 4; k++) {
                            int nr = cur[0] + dr[k], nc = cur[1] + dc[k];
                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && field[nr][nc] == 1 && !visited[nr][nc]) {
                                visited[nr][nc] = true;
                                q.add(new int[]{nr, nc});
                            }
                        }
                    }
                }
            }
        }
        return count;
    }
}
`,
    javascript: `var countLandBlocks = function (field) {
  if (!field.length || !field[0].length) return 0
  const rows = field.length, cols = field[0].length
  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false))
  let count = 0
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (field[r][c] === 1 && !visited[r][c]) {
        count++
        visited[r][c] = true
        const queue = [[r, c]]
        let head = 0
        while (head < queue.length) {
          const [cr, cc] = queue[head++]
          for (const [dr, dc] of dirs) {
            const nr = cr + dr, nc = cc + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && field[nr][nc] === 1 && !visited[nr][nc]) {
              visited[nr][nc] = true
              queue.push([nr, nc])
            }
          }
        }
      }
    }
  }
  return count
}
`,
  },
  'cp-gr-outage-spread': {
    python: `from typing import List
from collections import deque

class Solution:
    def minutesToFail(self, floor: List[List[int]]) -> int:
        if not floor or not floor[0]:
            return 0
        rows, cols = len(floor), len(floor[0])
        q = deque()
        healthy = 0
        for r in range(rows):
            for c in range(cols):
                if floor[r][c] == 2:
                    q.append((r, c, 0))
                elif floor[r][c] == 1:
                    healthy += 1
        if healthy == 0:
            return 0
        minutes = 0
        reached = 0
        grid = [row[:] for row in floor]
        while q:
            r, c, d = q.popleft()
            minutes = max(minutes, d)
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    reached += 1
                    q.append((nr, nc, d + 1))
        return minutes if reached == healthy else -1
`,
    cpp: `class Solution {
public:
    int minutesToFail(vector<vector<int>>& floor) {
        if (floor.empty() || floor[0].empty()) return 0;
        int rows = floor.size(), cols = floor[0].size();
        auto grid = floor;
        queue<tuple<int, int, int>> q;
        int healthy = 0;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 2) q.push({r, c, 0});
                else if (grid[r][c] == 1) healthy++;
            }
        }
        if (healthy == 0) return 0;
        int minutes = 0, reached = 0;
        int dr[4] = {1, -1, 0, 0};
        int dc[4] = {0, 0, 1, -1};
        while (!q.empty()) {
            auto [r, c, d] = q.front();
            q.pop();
            minutes = max(minutes, d);
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2;
                    reached++;
                    q.push({nr, nc, d + 1});
                }
            }
        }
        return reached == healthy ? minutes : -1;
    }
};
`,
    java: `class Solution {
    public int minutesToFail(int[][] floor) {
        if (floor.length == 0 || floor[0].length == 0) return 0;
        int rows = floor.length, cols = floor[0].length;
        int[][] grid = new int[rows][];
        for (int i = 0; i < rows; i++) grid[i] = floor[i].clone();
        ArrayDeque<int[]> q = new ArrayDeque<>();
        int healthy = 0;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 2) q.add(new int[]{r, c, 0});
                else if (grid[r][c] == 1) healthy++;
            }
        }
        if (healthy == 0) return 0;
        int minutes = 0, reached = 0;
        int[] dr = {1, -1, 0, 0};
        int[] dc = {0, 0, 1, -1};
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            int r = cur[0], c = cur[1], d = cur[2];
            minutes = Math.max(minutes, d);
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2;
                    reached++;
                    q.add(new int[]{nr, nc, d + 1});
                }
            }
        }
        return reached == healthy ? minutes : -1;
    }
}
`,
    javascript: `var minutesToFail = function (floor) {
  if (!floor.length || !floor[0].length) return 0
  const rows = floor.length, cols = floor[0].length
  const grid = floor.map((row) => row.slice())
  const queue = []
  let healthy = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c, 0])
      else if (grid[r][c] === 1) healthy++
    }
  }
  if (healthy === 0) return 0
  let minutes = 0, reached = 0, head = 0
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  while (head < queue.length) {
    const [r, c, d] = queue[head++]
    minutes = Math.max(minutes, d)
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
        grid[nr][nc] = 2
        reached++
        queue.push([nr, nc, d + 1])
      }
    }
  }
  return reached === healthy ? minutes : -1
}
`,
  },
  'cp-gr-semester-plan': {
    python: `import heapq
from typing import List

class Solution:
    def semesterPlan(self, n: int, prereqs: List[List[int]]) -> List[int]:
        indeg = [0] * n
        adj = [[] for _ in range(n)]
        for a, b in prereqs:
            adj[a].append(b)
            indeg[b] += 1
        heap = [i for i in range(n) if indeg[i] == 0]
        heapq.heapify(heap)
        order = []
        while heap:
            u = heapq.heappop(heap)
            order.append(u)
            for v in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    heapq.heappush(heap, v)
        return order if len(order) == n else []
`,
    cpp: `class Solution {
public:
    vector<int> semesterPlan(int n, vector<vector<int>>& prereqs) {
        vector<int> indeg(n, 0);
        vector<vector<int>> adj(n);
        for (auto& e : prereqs) {
            adj[e[0]].push_back(e[1]);
            indeg[e[1]]++;
        }
        priority_queue<int, vector<int>, greater<int>> pq;
        for (int i = 0; i < n; i++) if (indeg[i] == 0) pq.push(i);
        vector<int> order;
        while (!pq.empty()) {
            int u = pq.top();
            pq.pop();
            order.push_back(u);
            for (int v : adj[u]) {
                if (--indeg[v] == 0) pq.push(v);
            }
        }
        if ((int) order.size() != n) return {};
        return order;
    }
};
`,
    java: `class Solution {
    public int[] semesterPlan(int n, int[][] prereqs) {
        int[] indeg = new int[n];
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : prereqs) {
            adj.get(e[0]).add(e[1]);
            indeg[e[1]]++;
        }
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int i = 0; i < n; i++) if (indeg[i] == 0) pq.add(i);
        int[] order = new int[n];
        int idx = 0;
        while (!pq.isEmpty()) {
            int u = pq.poll();
            order[idx++] = u;
            for (int v : adj.get(u)) {
                if (--indeg[v] == 0) pq.add(v);
            }
        }
        if (idx != n) return new int[0];
        return order;
    }
}
`,
    javascript: `var semesterPlan = function (n, prereqs) {
  const indeg = new Array(n).fill(0)
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of prereqs) {
    adj[a].push(b)
    indeg[b]++
  }
  const heap = []
  const push = (x) => {
    heap.push(x)
    let i = heap.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (heap[p] <= heap[i]) break
      ;[heap[p], heap[i]] = [heap[i], heap[p]]
      i = p
    }
  }
  const pop = () => {
    const top = heap[0]
    const last = heap.pop()
    if (heap.length) {
      heap[0] = last
      let i = 0
      for (;;) {
        let l = i * 2 + 1, r = i * 2 + 2, s = i
        if (l < heap.length && heap[l] < heap[s]) s = l
        if (r < heap.length && heap[r] < heap[s]) s = r
        if (s === i) break
        ;[heap[s], heap[i]] = [heap[i], heap[s]]
        i = s
      }
    }
    return top
  }
  for (let i = 0; i < n; i++) if (indeg[i] === 0) push(i)
  const order = []
  while (heap.length) {
    const u = pop()
    order.push(u)
    for (const v of adj[u]) {
      indeg[v]--
      if (indeg[v] === 0) push(v)
    }
  }
  return order.length === n ? order : []
}
`,
  },
  'cp-gr-redundant-cable': {
    python: `from typing import List

class Solution:
    def findRedundant(self, edges: List[List[int]]) -> List[int]:
        n = len(edges)
        parent = list(range(n + 1))

        def find(x: int) -> int:
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for u, v in edges:
            ru, rv = find(u), find(v)
            if ru == rv:
                return [u, v]
            parent[ru] = rv
        return []
`,
    cpp: `class Solution {
public:
    vector<int> findRedundant(vector<vector<int>>& edges) {
        int n = edges.size();
        vector<int> parent(n + 1);
        for (int i = 0; i <= n; i++) parent[i] = i;
        function<int(int)> find = [&](int x) {
            while (parent[x] != x) {
                parent[x] = parent[parent[x]];
                x = parent[x];
            }
            return x;
        };
        for (auto& e : edges) {
            int ru = find(e[0]), rv = find(e[1]);
            if (ru == rv) return {e[0], e[1]};
            parent[ru] = rv;
        }
        return {};
    }
};
`,
    java: `class Solution {
    public int[] findRedundant(int[][] edges) {
        int n = edges.length;
        int[] parent = new int[n + 1];
        for (int i = 0; i <= n; i++) parent[i] = i;
        for (int[] e : edges) {
            int ru = find(parent, e[0]);
            int rv = find(parent, e[1]);
            if (ru == rv) return new int[]{e[0], e[1]};
            parent[ru] = rv;
        }
        return new int[0];
    }

    private int find(int[] parent, int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }
}
`,
    javascript: `var findRedundant = function (edges) {
  const n = edges.length
  const parent = Array.from({ length: n + 1 }, (_, i) => i)
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  for (const [u, v] of edges) {
    const ru = find(u), rv = find(v)
    if (ru === rv) return [u, v]
    parent[ru] = rv
  }
  return []
}
`,
  },
  'cp-gr-twin-loners': {
    python: `from typing import List

class Solution:
    def findLoners(self, ids: List[int]) -> List[int]:
        xor_all = 0
        for x in ids:
            xor_all ^= x
        lowbit = xor_all & (-xor_all)
        a = 0
        b = 0
        for x in ids:
            if x & lowbit:
                a ^= x
            else:
                b ^= x
        return [a, b] if a < b else [b, a]
`,
    cpp: `class Solution {
public:
    vector<int> findLoners(vector<int>& ids) {
        int xorAll = 0;
        for (int x : ids) xorAll ^= x;
        int lowbit = xorAll & (-xorAll);
        int a = 0, b = 0;
        for (int x : ids) {
            if (x & lowbit) a ^= x;
            else b ^= x;
        }
        return a < b ? vector<int>{a, b} : vector<int>{b, a};
    }
};
`,
    java: `class Solution {
    public int[] findLoners(int[] ids) {
        int xorAll = 0;
        for (int x : ids) xorAll ^= x;
        int lowbit = xorAll & (-xorAll);
        int a = 0, b = 0;
        for (int x : ids) {
            if ((x & lowbit) != 0) a ^= x;
            else b ^= x;
        }
        return a < b ? new int[]{a, b} : new int[]{b, a};
    }
}
`,
    javascript: `var findLoners = function (ids) {
  let xorAll = 0
  for (const x of ids) xorAll ^= x
  const lowbit = xorAll & (-xorAll)
  let a = 0, b = 0
  for (const x of ids) {
    if (x & lowbit) a ^= x
    else b ^= x
  }
  return a < b ? [a, b] : [b, a]
}
`,
  },
}
