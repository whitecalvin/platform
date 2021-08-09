# REST APIs

## Tweet Schema

```json
{
    id: string,             // 트윗 아이디
    text: string,           // 트윗 텍스트
    createdAt: Date,        // 트윗 생성 날짜
    name: string,           // 사용자 이름
    nick: string,           // 사용자 닉네임 (아이디)
    url: string (optional)  // 사용자 프로파일 사진 URL
}
```

## All Tweets

GET /tweets/all
GET /tweets/all/:id

## My Tweets

GET /tweets/all
POST /tweets/my/:id
PUT /tweets/my/:id
