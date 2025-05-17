# Kubernetes 클러스터 구축 과정

본 문서는 VirtualBox 기반 Ubuntu 환경에서 kubeadm을 사용하여 Kubernetes 클러스터를 구축한 과정을 기록한 것입니다.  
마스터 노드 1대와 워커 노드 2대를 구성하였으며, Calico 네트워크 플러그인을 사용하였습니다.  
본 설치 과정은 졸업작품의 인프라 구성 증빙자료로 사용됩니다.

1. K8s 설치 (모든 노드)
- 기본 준비
  - vi /etc/hosts 내용 확인
    - [주의] /etc/network/hostname 이 아닙니다. (/etc/network/hostname에는 호스트 이름만 존재)
      - 호스트 이름 변경은 sudo hostnamectl set-hostname 이름
  - sudo apt update
  - sudo apt install -y openssh-server net-tools vim curl
  - 방화벽 제거: sudo ufw disable
- 도커 설치
  - sudo apt install -y docker.io
- 도커 서비스 등록 및 실행
  - sudo systemctl enable docker
  - sudo systemctl start docker
- swap 중지
  - sudo swapoff -a
  - sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
- IP 포워딩 기능 활성화
  - sudo tee /etc/modules-load.d/containerd.conf
     overlay
     br_netfilter
     EOF
  - modprobe overlay
  - modprobe br_netfilter
- 노드 통신을 위한 브릿지 설정
  - sudo tee /etc/modules-load.d/k8s.conf
     overlay
     br_netfilter
     EOF
  - sudo tee /etc/sysctl.d/k8s.conf
     net.bridge.bridge-nf-call-iptables  = 1
     net.bridge.bridge-nf-call-ip6tables = 1
     net.ipv4.ip_forward                 = 1
     EOF
  - sudo tee /etc/sysctl.d/99-kubernetes-cri.conf
     net.bridge.bridge-nf-call-iptables  = 1
     net.bridge.bridge-nf-call-ip6tables = 1
     net.ipv4.ip_forward                 = 1
     EOF
  - sudo sysctl --system
- 컨테이너 런타임 환경 구성
  - mkdir /etc/containerd
  - containerd config default | sudo tee /etc/containerd/config.toml
- containerd cgroup 설정
  - vi /etc/containerd/config.toml
    - [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options] 구문에서 SystemdCgroup = true 수정 및 확인
  - sudo service containerd restart
- docker daemon 설정
  - sudo tee /etc/docker/daemon.json
    {
      "exec-opts": ["native.cgroupdriver=systemd"],
      "log-driver": "json-file",
      "log-opts": {
        "max-size": "100m"
      },
      "storage-driver": "overlay2"
    }
    EOF
- docker 구성 설정
  - sudo mkdir -p /etc/systemd/system/docker.service.d
  - sudo usermod -aG docker [우분투사용자ID]
  - sudo systemctl daemon-reload
  - sudo systemctl restart kubelet
  - sudo systemctl enable docker
  - sudo systemctl restart docker
  - sudo systemctl restart containerd.service
- 필수 패키지 설치
  - sudo apt-get install -y apt-transport-https ca-certificates curl gpg
- GPG 키 저장 디렉토리 생성
  - sudo mkdir -p -m 755 /etc/apt/keyrings
  - ubuntu 22.04는 기본적으로 /etc/apt/keyrings 디렉토리가 있음 (위 명령어 적용하면 해당 디렉토리가 존재한다는 내용이 출력됨)
- K8s GPG 키 등록
  - curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
    - 여기 버전이 v1.29이면 K8s 공식 리포지토리에서도 v1.29
  - 참조했던 사이트와 비교
    - curl -fsSLo /etc/apt/keyrings/kubernetes-archive-keyring.gpg https://dl.k8s.io/apt/doc/apt-key.gpg
- K8s 공식 리포지토리 추가
  - echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
  - 참조했던 사이트와 비교
    - sudo echo "deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
    - [중요] https://apt.kubernetes.io/ 는 더이상 사용하지 않음
- 패키지 목록 업데이트
  - sudo apt update
- K8s 주요 패키지 설치
  - sudo apt install -y kubelet kubeadm kubectl
- 버전 고정 (자동 업데이트 방지)
  - sudo apt-mark hold kubelet kubeadm kubectl
- 자동 시작 등록
  - sudo systemctl daemon-reload
  - sudo systemctl restart kubelet.service
  - sudo systemctl enable --now kubelet.service

2. 마스터 노드
- 클러스터 초기화
  - [기본] sudo kubeadm init
  - [calico를 사용한다면] sudo kubeadm init --pod-network-cidr=192.168.0.0/16
    - calico의 Pod 네트워킹은 192.168.x.x 대역으로 생성하는 것이 디폴트 설정임
  - [calico를 사용하면서 containerd를 사용] sudo kubeadm init --pod-network-cidr=192.168.0.0/16 --cri-socket /run/containerd/containerd.sock --upload-certs --control-plane-endpoint=master
- 사용자 적용
  - [중요] kubeadm init 이후 보이는 아래 명령어를 복사 후 붙여넣기
    - mkdir -p $HOME/.kube
    - sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
    - sudo chown $(id -u):$(id -g) $HOME/.kube/config
- 워크노드 구성 내용 복사
  - [중요] kubeadm init 이후 보이는 아래 명령어를 복사 후 붙여넣기
    - kubeadm join <Master_IP>:6443 --token <TOKEN> --discovery-token-ca-cert-hash sha256:<HASH>

3. 워커 노드
- 클러스터 조인
  - 마스터 노드에서 kubeadm init 명령어 이후 보이는 명령어 적용
  - sudo kubeadm join <Master_IP>:6443 --token <TOKEN> --discovery-token-ca-cert-hash sha256:<HASH>

4. 마스터 노드 클러스터링 구성 마무리 및 확인
- 클러스터링 확인
  - kubectl get nodes
    - 클러스터링 리스트가 보이면서 STATUS 부분이 NotReady 상태임을 확인
- 칼리코 구성
  - kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
- 칼리코 Pod 확인
  - kubectl get pods --all-namespaces -o wide
    - calico로 시작되는 pod의 STATUS가 Running 임을 확인
- 클러스터링 재확인
  - kubectl get nodes
    - 클러스터링 리스트가 보이면서 STATUS 부분이 Ready 상태임을 확인
