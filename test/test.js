'use strict'

const test = require('ava')
const {spawn} = require('child_process')
const path = require('path')
const fs = require('fs')

const fixturesPath = path.join(__dirname, 'fixtures')
const {getPort, waitForServer, genConfig, fetch} = require('./helpers')

const ip = '127.0.0.1'

let url, configPath, pid
test.before(async t => {
  let port = await getPort()
  configPath = genConfig(fixturesPath, 'hook.json.tmpl', path.join(fixturesPath, 'Hookecho'))
  pid = spawn(path.join(__dirname, '../bin/webhook-server'),
    [
      '--hooks', configPath,
      '--ip', path.join(ip),
      '--port', port,
      '--verbose'
    ]
  )
  url = 'http://' + ip + ':' + port + '/hooks'
  await waitForServer(url)
})

test.after.always(t => {
  if (pid) pid.kill('SIGINT')
  fs.unlinkSync(configPath)
})

let suits = [
  {
    title: 'github',
    id: 'github',
    headers: {'X-Hub-Signature': 'sha1=bda34713e77a0b61421cf6da92bec40ccb858854'},
    body: `{"ref":"refs/heads/master","before":"0000000000000000000000000000000000000000","after":"85f4cb1fd87e6617f9be7bb9cd3f078a6431e8cd","created":true,"deleted":false,"forced":false,"base_ref":null,"compare":"https://github.com/sigoden/test/commit/85f4cb1fd87e","commits":[{"id":"85f4cb1fd87e6617f9be7bb9cd3f078a6431e8cd","tree_id":"3e46501255b4c36e0b2f72149b4a78aa833ac174","distinct":true,"message":"--","timestamp":"2017-07-11T10:59:19+08:00","url":"https://github.com/sigoden/test/commit/85f4cb1fd87e6617f9be7bb9cd3f078a6431e8cd","author":{"name":"sigoden","email":"sigoden@gmail.com"},"committer":{"name":"sigoden","email":"sigoden@gmail.com"},"added":["date"],"removed":[],"modified":[]}],"head_commit":{"id":"85f4cb1fd87e6617f9be7bb9cd3f078a6431e8cd","tree_id":"3e46501255b4c36e0b2f72149b4a78aa833ac174","distinct":true,"message":"--","timestamp":"2017-07-11T10:59:19+08:00","url":"https://github.com/sigoden/test/commit/85f4cb1fd87e6617f9be7bb9cd3f078a6431e8cd","author":{"name":"sigoden","email":"sigoden@gmail.com"},"committer":{"name":"sigoden","email":"sigoden@gmail.com"},"added":["date"],"removed":[],"modified":[]},"repository":{"id":96843031,"name":"test","full_name":"sigoden/test","owner":{"name":"sigoden","email":"sigoden@126.com","login":"sigoden","id":4012553,"avatar_url":"https://avatars0.githubusercontent.com/u/4012553?v=3","gravatar_id":"","url":"https://api.github.com/users/sigoden","html_url":"https://github.com/sigoden","followers_url":"https://api.github.com/users/sigoden/followers","following_url":"https://api.github.com/users/sigoden/following{/other_user}","gists_url":"https://api.github.com/users/sigoden/gists{/gist_id}","starred_url":"https://api.github.com/users/sigoden/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/sigoden/subscriptions","organizations_url":"https://api.github.com/users/sigoden/orgs","repos_url":"https://api.github.com/users/sigoden/repos","events_url":"https://api.github.com/users/sigoden/events{/privacy}","received_events_url":"https://api.github.com/users/sigoden/received_events","type":"User","site_admin":false},"private":false,"html_url":"https://github.com/sigoden/test","description":"just a test repo","fork":false,"url":"https://github.com/sigoden/test","forks_url":"https://api.github.com/repos/sigoden/test/forks","keys_url":"https://api.github.com/repos/sigoden/test/keys{/key_id}","collaborators_url":"https://api.github.com/repos/sigoden/test/collaborators{/collaborator}","teams_url":"https://api.github.com/repos/sigoden/test/teams","hooks_url":"https://api.github.com/repos/sigoden/test/hooks","issue_events_url":"https://api.github.com/repos/sigoden/test/issues/events{/number}","events_url":"https://api.github.com/repos/sigoden/test/events","assignees_url":"https://api.github.com/repos/sigoden/test/assignees{/user}","branches_url":"https://api.github.com/repos/sigoden/test/branches{/branch}","tags_url":"https://api.github.com/repos/sigoden/test/tags","blobs_url":"https://api.github.com/repos/sigoden/test/git/blobs{/sha}","git_tags_url":"https://api.github.com/repos/sigoden/test/git/tags{/sha}","git_refs_url":"https://api.github.com/repos/sigoden/test/git/refs{/sha}","trees_url":"https://api.github.com/repos/sigoden/test/git/trees{/sha}","statuses_url":"https://api.github.com/repos/sigoden/test/statuses/{sha}","languages_url":"https://api.github.com/repos/sigoden/test/languages","stargazers_url":"https://api.github.com/repos/sigoden/test/stargazers","contributors_url":"https://api.github.com/repos/sigoden/test/contributors","subscribers_url":"https://api.github.com/repos/sigoden/test/subscribers","subscription_url":"https://api.github.com/repos/sigoden/test/subscription","commits_url":"https://api.github.com/repos/sigoden/test/commits{/sha}","git_commits_url":"https://api.github.com/repos/sigoden/test/git/commits{/sha}","comments_url":"https://api.github.com/repos/sigoden/test/comments{/number}","issue_comment_url":"https://api.github.com/repos/sigoden/test/issues/comments{/number}","contents_url":"https://api.github.com/repos/sigoden/test/contents/{+path}","compare_url":"https://api.github.com/repos/sigoden/test/compare/{base}...{head}","merges_url":"https://api.github.com/repos/sigoden/test/merges","archive_url":"https://api.github.com/repos/sigoden/test/{archive_format}{/ref}","downloads_url":"https://api.github.com/repos/sigoden/test/downloads","issues_url":"https://api.github.com/repos/sigoden/test/issues{/number}","pulls_url":"https://api.github.com/repos/sigoden/test/pulls{/number}","milestones_url":"https://api.github.com/repos/sigoden/test/milestones{/number}","notifications_url":"https://api.github.com/repos/sigoden/test/notifications{?since,all,participating}","labels_url":"https://api.github.com/repos/sigoden/test/labels{/name}","releases_url":"https://api.github.com/repos/sigoden/test/releases{/id}","deployments_url":"https://api.github.com/repos/sigoden/test/deployments","created_at":1499741064,"updated_at":"2017-07-11T02:44:24Z","pushed_at":1499741992,"git_url":"git://github.com/sigoden/test.git","ssh_url":"git@github.com:sigoden/test.git","clone_url":"https://github.com/sigoden/test.git","svn_url":"https://github.com/sigoden/test","homepage":null,"size":0,"stargazers_count":0,"watchers_count":0,"language":null,"has_issues":true,"has_projects":true,"has_downloads":true,"has_wiki":true,"has_pages":false,"forks_count":0,"mirror_url":null,"open_issues_count":0,"forks":0,"open_issues":0,"watchers":0,"default_branch":"master","stargazers":0,"master_branch":"master"},"pusher":{"name":"sigoden","email":"sigoden@126.com"},"sender":{"login":"sigoden","id":4012553,"avatar_url":"https://avatars0.githubusercontent.com/u/4012553?v=3","gravatar_id":"","url":"https://api.github.com/users/sigoden","html_url":"https://github.com/sigoden","followers_url":"https://api.github.com/users/sigoden/followers","following_url":"https://api.github.com/users/sigoden/following{/other_user}","gists_url":"https://api.github.com/users/sigoden/gists{/gist_id}","starred_url":"https://api.github.com/users/sigoden/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/sigoden/subscriptions","organizations_url":"https://api.github.com/users/sigoden/orgs","repos_url":"https://api.github.com/users/sigoden/repos","events_url":"https://api.github.com/users/sigoden/events{/privacy}","received_events_url":"https://api.github.com/users/sigoden/received_events","type":"User","site_admin":false}}`,
    status: 200,
    text: `env: HOOK_head_commit.timestamp=2017-07-11T10:59:19+08:00\narg: 85f4cb1fd87e6617f9be7bb9cd3f078a6431e8cd sigoden@gmail.com\n`
  },
  {
    title: 'gitlab',
    id: 'gitlab',
    headers: {'X-Gitlab-Event': 'Push Hook'},
    body: `{"object_kind":"push","event_name":"push","before":"0000000000000000000000000000000000000000","after":"da86d7d9776a4e00850b7395810dc74ddb6bf9cc","ref":"refs/heads/master","checkout_sha":"da86d7d9776a4e00850b7395810dc74ddb6bf9cc","message":null,"user_id":927249,"user_name":"sigoden","user_username":"sigoden","user_email":"sigoden@gmail.com","user_avatar":"https://secure.gravatar.com/avatar/4487979beec27e94aff04365cdb937c6?s=80&d=identicon","project_id":3679272,"project":{"name":"test","description":"","web_url":"https://gitlab.com/sigoden/test","avatar_url":null,"git_ssh_url":"git@gitlab.com:sigoden/test.git","git_http_url":"https://gitlab.com/sigoden/test.git","namespace":"sigoden","visibility_level":0,"path_with_namespace":"sigoden/test","default_branch":"master","homepage":"https://gitlab.com/sigoden/test","url":"git@gitlab.com:sigoden/test.git","ssh_url":"git@gitlab.com:sigoden/test.git","http_url":"https://gitlab.com/sigoden/test.git"},"commits":[{"id":"da86d7d9776a4e00850b7395810dc74ddb6bf9cc","message":"--\\n","timestamp":"2017-07-11T12:21:13+08:00","url":"https://gitlab.com/sigoden/test/commit/da86d7d9776a4e00850b7395810dc74ddb6bf9cc","author":{"name":"sigoden","email":"sigoden@gmail.com"},"added":["date"],"modified":[],"removed":[]}],"total_commits_count":1,"repository":{"name":"test","url":"git@gitlab.com:sigoden/test.git","description":"","homepage":"https://gitlab.com/sigoden/test","git_http_url":"https://gitlab.com/sigoden/test.git","git_ssh_url":"git@gitlab.com:sigoden/test.git","visibility_level":0}}`,
    status: 200,
    text: `env: \narg: da86d7d9776a4e00850b7395810dc74ddb6bf9cc sigoden sigoden@gmail.com\n`
  },
  {
    title: 'empty payload',
    id: 'github',
    status: 400,
    text: `Hook rules were not satisfied.`
  },
  {
    title: 'empty payload',
    id: 'gitlab',
    status: 200,
    text: `Hook rules were not satisfied.`
  }
]

suits.forEach(v => {
  test(v.title, async t => {
    let result = await fetch(`${url}/${v.id}`, v.headers || {}, v.body || '')
    t.is(result.text, v.text)
    t.is(result.status, v.status)
  })
})
