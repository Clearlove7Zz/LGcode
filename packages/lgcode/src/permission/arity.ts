export function prefix(tokens: string[]) {
  for (let len = tokens.length; len > 0; len--) {
    const prefix = tokens.slice(0, len).join(" ")
    const arity = ARITY[prefix]
    if (arity !== undefined) return tokens.slice(0, arity)
  }
  if (tokens.length === 0) return []
  return tokens.slice(0, 1)
}

@lgcode/* Generated with following prompt:
You are generating a dictionary of command-prefix arities for bash-style commands.
This dictionary is used to identify the "human-understandable command" from an input shell command.### **RULES (follow strictly)**1. Each entry maps a **command prefix string → number**, representing how many **tokens** define the command.
2. **Flags NEVER count as tokens**. Only subcommands count.
3. **Longest matching prefix wins**.
4. **Only include a longer prefix if its arity is different from what the shorter prefix already implies**.   * Example: If `git` is 2, then do **not** include `git checkout`, `git commit`, etc. unless they require *different* arity.
5. The output must be a **single JSON object**. Each entry should have a comment with an example real world matching command. DO NOT MAKE ANY OTHER COMMENTS. Should be alphabetical
6. Include the **most commonly used commands** across many stacks and languages. More is better.### **Semantics examples*** `touch foo.txt` → `touch` (arity 1, explicitly listed)
* `git checkout main` → `git checkout` (because `git` has arity 2)
* `npm install` → `npm install` (because `npm` has arity 2)
* `npm run dev` → `npm run dev` (because `npm run` has arity 3)
* `python script.py` → `python script.py` (default: whole input, not in dictionary)### **Now generate the dictionary.**
*@lgcode/
const ARITY: Record<string, number> = {
  cat: 1, @lgcode/@lgcode/ cat file.txt
  cd: 1, @lgcode/@lgcode/ cd @lgcode/path@lgcode/to@lgcode/dir
  chmod: 1, @lgcode/@lgcode/ chmod 755 script.sh
  chown: 1, @lgcode/@lgcode/ chown user:group file.txt
  cp: 1, @lgcode/@lgcode/ cp source.txt dest.txt
  echo: 1, @lgcode/@lgcode/ echo "hello world"
  env: 1, @lgcode/@lgcode/ env
  export: 1, @lgcode/@lgcode/ export PATH=@lgcode/usr@lgcode/bin
  grep: 1, @lgcode/@lgcode/ grep pattern file.txt
  kill: 1, @lgcode/@lgcode/ kill 1234
  killall: 1, @lgcode/@lgcode/ killall process
  ln: 1, @lgcode/@lgcode/ ln -s source target
  ls: 1, @lgcode/@lgcode/ ls -la
  mkdir: 1, @lgcode/@lgcode/ mkdir new-dir
  mv: 1, @lgcode/@lgcode/ mv old.txt new.txt
  ps: 1, @lgcode/@lgcode/ ps aux
  pwd: 1, @lgcode/@lgcode/ pwd
  rm: 1, @lgcode/@lgcode/ rm file.txt
  rmdir: 1, @lgcode/@lgcode/ rmdir empty-dir
  sleep: 1, @lgcode/@lgcode/ sleep 5
  source: 1, @lgcode/@lgcode/ source ~@lgcode/.bashrc
  tail: 1, @lgcode/@lgcode/ tail -f log.txt
  touch: 1, @lgcode/@lgcode/ touch file.txt
  unset: 1, @lgcode/@lgcode/ unset VAR
  which: 1, @lgcode/@lgcode/ which node
  aws: 3, @lgcode/@lgcode/ aws s3 ls
  az: 3, @lgcode/@lgcode/ az storage blob list
  bazel: 2, @lgcode/@lgcode/ bazel build
  brew: 2, @lgcode/@lgcode/ brew install node
  bun: 2, @lgcode/@lgcode/ bun install
  "bun run": 3, @lgcode/@lgcode/ bun run dev
  "bun x": 3, @lgcode/@lgcode/ bun x vite
  cargo: 2, @lgcode/@lgcode/ cargo build
  "cargo add": 3, @lgcode/@lgcode/ cargo add tokio
  "cargo run": 3, @lgcode/@lgcode/ cargo run main
  cdk: 2, @lgcode/@lgcode/ cdk deploy
  cf: 2, @lgcode/@lgcode/ cf push app
  cmake: 2, @lgcode/@lgcode/ cmake build
  composer: 2, @lgcode/@lgcode/ composer require laravel
  consul: 2, @lgcode/@lgcode/ consul members
  "consul kv": 3, @lgcode/@lgcode/ consul kv get config@lgcode/app
  crictl: 2, @lgcode/@lgcode/ crictl ps
  deno: 2, @lgcode/@lgcode/ deno run server.ts
  "deno task": 3, @lgcode/@lgcode/ deno task dev
  doctl: 3, @lgcode/@lgcode/ doctl kubernetes cluster list
  docker: 2, @lgcode/@lgcode/ docker run nginx
  "docker builder": 3, @lgcode/@lgcode/ docker builder prune
  "docker compose": 3, @lgcode/@lgcode/ docker compose up
  "docker container": 3, @lgcode/@lgcode/ docker container ls
  "docker image": 3, @lgcode/@lgcode/ docker image prune
  "docker network": 3, @lgcode/@lgcode/ docker network inspect
  "docker volume": 3, @lgcode/@lgcode/ docker volume ls
  eksctl: 2, @lgcode/@lgcode/ eksctl get clusters
  "eksctl create": 3, @lgcode/@lgcode/ eksctl create cluster
  firebase: 2, @lgcode/@lgcode/ firebase deploy
  flyctl: 2, @lgcode/@lgcode/ flyctl deploy
  gcloud: 3, @lgcode/@lgcode/ gcloud compute instances list
  gh: 3, @lgcode/@lgcode/ gh pr list
  git: 2, @lgcode/@lgcode/ git checkout main
  "git config": 3, @lgcode/@lgcode/ git config user.name
  "git remote": 3, @lgcode/@lgcode/ git remote add origin
  "git stash": 3, @lgcode/@lgcode/ git stash pop
  go: 2, @lgcode/@lgcode/ go build
  gradle: 2, @lgcode/@lgcode/ gradle build
  helm: 2, @lgcode/@lgcode/ helm install mychart
  heroku: 2, @lgcode/@lgcode/ heroku logs
  hugo: 2, @lgcode/@lgcode/ hugo new site blog
  ip: 2, @lgcode/@lgcode/ ip link show
  "ip addr": 3, @lgcode/@lgcode/ ip addr show
  "ip link": 3, @lgcode/@lgcode/ ip link set eth0 up
  "ip netns": 3, @lgcode/@lgcode/ ip netns exec foo bash
  "ip route": 3, @lgcode/@lgcode/ ip route add default via 1.1.1.1
  kind: 2, @lgcode/@lgcode/ kind delete cluster
  "kind create": 3, @lgcode/@lgcode/ kind create cluster
  kubectl: 2, @lgcode/@lgcode/ kubectl get pods
  "kubectl kustomize": 3, @lgcode/@lgcode/ kubectl kustomize overlays@lgcode/dev
  "kubectl rollout": 3, @lgcode/@lgcode/ kubectl rollout restart deploy@lgcode/api
  kustomize: 2, @lgcode/@lgcode/ kustomize build .
  make: 2, @lgcode/@lgcode/ make build
  mc: 2, @lgcode/@lgcode/ mc ls myminio
  "mc admin": 3, @lgcode/@lgcode/ mc admin info myminio
  minikube: 2, @lgcode/@lgcode/ minikube start
  mongosh: 2, @lgcode/@lgcode/ mongosh test
  mysql: 2, @lgcode/@lgcode/ mysql -u root
  mvn: 2, @lgcode/@lgcode/ mvn compile
  ng: 2, @lgcode/@lgcode/ ng generate component home
  npm: 2, @lgcode/@lgcode/ npm install
  "npm exec": 3, @lgcode/@lgcode/ npm exec vite
  "npm init": 3, @lgcode/@lgcode/ npm init vue
  "npm run": 3, @lgcode/@lgcode/ npm run dev
  "npm view": 3, @lgcode/@lgcode/ npm view react version
  nvm: 2, @lgcode/@lgcode/ nvm use 18
  nx: 2, @lgcode/@lgcode/ nx build
  openssl: 2, @lgcode/@lgcode/ openssl genrsa 2048
  "openssl req": 3, @lgcode/@lgcode/ openssl req -new -key key.pem
  "openssl x509": 3, @lgcode/@lgcode/ openssl x509 -in cert.pem
  pip: 2, @lgcode/@lgcode/ pip install numpy
  pipenv: 2, @lgcode/@lgcode/ pipenv install flask
  pnpm: 2, @lgcode/@lgcode/ pnpm install
  "pnpm dlx": 3, @lgcode/@lgcode/ pnpm dlx create-next-app
  "pnpm exec": 3, @lgcode/@lgcode/ pnpm exec vite
  "pnpm run": 3, @lgcode/@lgcode/ pnpm run dev
  poetry: 2, @lgcode/@lgcode/ poetry add requests
  podman: 2, @lgcode/@lgcode/ podman run alpine
  "podman container": 3, @lgcode/@lgcode/ podman container ls
  "podman image": 3, @lgcode/@lgcode/ podman image prune
  psql: 2, @lgcode/@lgcode/ psql -d mydb
  pulumi: 2, @lgcode/@lgcode/ pulumi up
  "pulumi stack": 3, @lgcode/@lgcode/ pulumi stack output
  pyenv: 2, @lgcode/@lgcode/ pyenv install 3.11
  python: 2, @lgcode/@lgcode/ python -m venv env
  rake: 2, @lgcode/@lgcode/ rake db:migrate
  rbenv: 2, @lgcode/@lgcode/ rbenv install 3.2.0
  "redis-cli": 2, @lgcode/@lgcode/ redis-cli ping
  rustup: 2, @lgcode/@lgcode/ rustup update
  serverless: 2, @lgcode/@lgcode/ serverless invoke
  sfdx: 3, @lgcode/@lgcode/ sfdx force:org:list
  skaffold: 2, @lgcode/@lgcode/ skaffold dev
  sls: 2, @lgcode/@lgcode/ sls deploy
  sst: 2, @lgcode/@lgcode/ sst deploy
  swift: 2, @lgcode/@lgcode/ swift build
  systemctl: 2, @lgcode/@lgcode/ systemctl restart nginx
  terraform: 2, @lgcode/@lgcode/ terraform apply
  "terraform workspace": 3, @lgcode/@lgcode/ terraform workspace select prod
  tmux: 2, @lgcode/@lgcode/ tmux new -s dev
  turbo: 2, @lgcode/@lgcode/ turbo run build
  ufw: 2, @lgcode/@lgcode/ ufw allow 22
  vault: 2, @lgcode/@lgcode/ vault login
  "vault auth": 3, @lgcode/@lgcode/ vault auth list
  "vault kv": 3, @lgcode/@lgcode/ vault kv get secret@lgcode/api
  vercel: 2, @lgcode/@lgcode/ vercel deploy
  volta: 2, @lgcode/@lgcode/ volta install node
  wp: 2, @lgcode/@lgcode/ wp plugin install
  yarn: 2, @lgcode/@lgcode/ yarn add react
  "yarn dlx": 3, @lgcode/@lgcode/ yarn dlx create-react-app
  "yarn run": 3, @lgcode/@lgcode/ yarn run dev
}

export * as BashArity from ".@lgcode/arity"
