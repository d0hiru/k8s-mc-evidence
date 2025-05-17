# Graduation Project: Minecraft Server Scaling on Kubernetes

본 프로젝트는 쿠버네티스를 활용하여 마인크래프트 서버에 자동 확장 및 로드밸런싱 기능을 적용한 시스템입니다. 과부하 시 서버를 자동으로 확장하여 트래픽을 분산시키고, 불필요할 경우 서버를 줄여 자원을 효율적으로 관리합니다.

## 주요 구성
- Kubernetes Cluster (3 nodes)
- Minecraft Server as a Pod
- HPA (Horizontal Pod Autoscaler)
- LoadBalancer Service
- Grafana + Prometheus 모니터링
- 마인크래프트 봇 자동 접속 (부하 생성)

## 팀원
- 길도희: 클러스터 구축, 마크 서버 배포, HPA 구성, 모니터링 대시보드
- 최다연: 봇 자동 접속, 부하 테스트 스크립트, YAML 관리, 시연 구성
