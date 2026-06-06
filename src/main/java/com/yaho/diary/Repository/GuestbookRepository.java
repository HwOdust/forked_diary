package com.yaho.diary.Repository;

import com.yaho.diary.Entity.Guestbook;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GuestbookRepository extends JpaRepository<Guestbook, Long> {
    // 최신순으로 정렬해서 가져오기
    List<Guestbook> findAllByOrderByIdDesc();
}