package main

import (
	"fmt"
	"time"
)

type rRateLimit struct {
	limit      int           // 一定期間内に許可されるリクエスト数
	interval   time.Duration // リクエストが許可される期間
	tokens     int           // 現在の残りトークン数
	lastRefill time.Time     // 最後にトークンが補充された時刻
}

func NewRateLimit(limit int, interval time.Duration) *rRateLimit {
	return &rRateLimit{
		limit:    limit,
		interval: interval,
		tokens:   limit,
	}
}

func (rl *rRateLimit) AllowRequest() bool {
	now := time.Now()

	if now.Sub(rl.lastRefill) > rl.interval {
		rl.tokens = rl.limit
		rl.lastRefill = now
	}

	if rl.tokens > 0 {
		rl.tokens--
		return true
	}

	return false
}

func main() {
	rl := NewRateLimit(3, time.Second)
	for i := 0; i < 10; i++ {
		if rl.AllowRequest() {
			fmt.Printf("Request %d allowed\n", i+1)
		} else {
			fmt.Printf("Request %d denied\n", i+1)
		}
		time.Sleep(200 * time.Millisecond)
	}
}
