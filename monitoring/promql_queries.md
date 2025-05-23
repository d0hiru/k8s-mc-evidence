## Grafana 시각화 항목

| 항목 | 설명 | Prometheus 쿼리 |
|------|------|----------------|
| **Pod 수 변화** | Minecraft 서버의 현재 실행 중인 Pod 개수 | `kube_deployment_status_replicas{deployment="minecraft-deployment", namespace="default"}` |
| **Pod별 CPU 사용률** | 각 Minecraft Pod의 CPU 사용률 | `sum by (pod) (rate(container_cpu_usage_seconds_total{namespace="default", pod=~"minecraft.*"}[2m])) * 100` |
| **노드 CPU 사용률 (CPU Busy)** | 노드 전체에서 실제 사용 중인 CPU 비율 | `100 * (1 - avg(rate(node_cpu_seconds_total{mode="idle", instance="$node"}[$__rate_interval])))` |
| **시스템 부하 (Sys Load)** | 노드의 1분 평균 Load | `scalar(node_load1{instance="$node",job="$job"}) * 100 / count(count(node_cpu_seconds_total{instance="$node",job="$job"}) by (cpu))` |
| **메모리 사용률 (RAM Used)** | 사용 중인 RAM 비율 | `(1 - (node_memory_MemAvailable_bytes{instance="$node", job="$job"} / node_memory_MemTotal_bytes{instance="$node", job="$job"})) * 100` |


