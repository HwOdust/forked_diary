package com.yaho.diary.Controller;

import com.yaho.diary.Entity.Guestbook;
import com.yaho.diary.Repository.GuestbookRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guestbook")
@CrossOrigin(origins = "http://localhost:5173") // 리액트 포트 허용
public class GuestbookController {

    private final GuestbookRepository guestbookRepository;

    public GuestbookController(GuestbookRepository guestbookRepository) {
        this.guestbookRepository = guestbookRepository;
    }

    // 과제 요건 4: Retrieve (조회)
    @GetMapping
    public ResponseEntity<List<Guestbook>> getMessages() {
        return ResponseEntity.ok(guestbookRepository.findAllByOrderByIdDesc());
    }

    // 과제 요건 4: Insert (삽입)
    @PostMapping
    public ResponseEntity<Guestbook> addMessage(@RequestBody Guestbook guestbook) {
        Guestbook saved = guestbookRepository.save(guestbook);
        return ResponseEntity.ok(saved);
    }

    // 방명록 전체 초기화 API 추가
    @DeleteMapping("/clear")
    public ResponseEntity<String> clearMessages() {
        guestbookRepository.deleteAll(); // DB의 모든 방명록 데이터 삭제
        return ResponseEntity.ok("방명록이 초기화되었습니다.");
    }
}