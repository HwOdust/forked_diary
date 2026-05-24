package com.yaho.diary.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yaho.diary.Dto.AiScheduleDto;
import com.yaho.diary.Entity.FixedSchedule;
import com.yaho.diary.Entity.Schedule;
import com.yaho.diary.Repository.FixedScheduleRepository;
import com.yaho.diary.Repository.ScheduleRepository;

@Service
public class GeminiService {

    private final ScheduleRepository scheduleRepository;
    private final FixedScheduleRepository fixedScheduleRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String[] DAY_NAMES =
            {"월", "화", "수", "목", "금", "토", "일"};

    public GeminiService(
            ScheduleRepository scheduleRepository,
            FixedScheduleRepository fixedScheduleRepository
    ) {
        this.scheduleRepository = scheduleRepository;
        this.fixedScheduleRepository = fixedScheduleRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public AiScheduleDto extractSchedule(String userMessage) throws Exception {

        LocalDate today = LocalDate.now();

        String todayStr =
                today + " (" +
                today.getDayOfWeek()
                        .getDisplayName(TextStyle.FULL, Locale.KOREAN)
                + ")";

        LocalDate mon = today.with(DayOfWeek.MONDAY);

        String weekInfo = String.format(
                "이번주 날짜:\n월요일: %s\n화요일: %s\n수요일: %s\n목요일: %s\n금요일: %s\n토요일: %s\n일요일: %s",
                mon,
                mon.plusDays(1),
                mon.plusDays(2),
                mon.plusDays(3),
                mon.plusDays(4),
                mon.plusDays(5),
                mon.plusDays(6)
        );

        String now =
                LocalTime.now()
                        .withSecond(0)
                        .withNano(0)
                        .toString();

        String fixedInfo = makeFixedInfo(today);

        String prompt = """
                너는 일정 관리 AI야.
                반드시 JSON만 출력해. 설명 금지.

                현재 날짜:
                %s

                현재 시간:
                %s

                %s

                기존 고정 일정:
                %s

                위 고정 일정 시간대와 겹치지 않게 일정을 추가해줘.

                [action 판단 기준]
                - "매주", "정기적으로", "항상", "고정", "매번" 같은 말이 있으면 → add_fixed
                - 특정 날짜/요일만 언급하면 → add
                - 삭제 요청 → delete
                - 수정 요청 → update

                반환 형식:
                {
                  "action": "add | add_fixed | update | delete",
                  "title": "",
                  "date": "YYYY-MM-DD 또는 null",
                  "startTime": "HH:mm",
                  "endTime": "HH:mm",
                  "category": "",
                  "dayOfWeek": null,
                  "targetTitle": "",
                  "targetDate": ""
                }

                규칙:
                1. category는 반드시 회의, 공부, 약속, 운동, 기타 중 하나만 사용
                2. title을 사용자가 정하지 않았다면 category와 동일하게 설정
                3. endTime을 사용자가 정하지 않았다면 startTime 기준 1시간 뒤로 설정
                4. add_fixed: dayOfWeek 필수 (0=월,1=화,2=수,3=목,4=금,5=토,6=일), date는 반드시 null
                5. add: date 필수, dayOfWeek는 반드시 null
                6. 삭제/수정: targetTitle과 targetDate에 대상 정보를 넣어
                7. startTime이 없으면 현재 시간 기준 1시간 뒤를 사용
                8. JSON 코드블럭 ```json 사용 금지
                9. 오직 JSON 객체만 출력

                사용자 입력:
                %s
                """.formatted(todayStr, now, weekInfo, fixedInfo, userMessage);

        String rawJson = callGemini(prompt);

        System.out.println("Gemini 결과:");
        System.out.println(rawJson);

        AiScheduleDto dto =
                objectMapper.readValue(rawJson, AiScheduleDto.class);

        handleSchedule(dto);

        return dto;
    }

    private String makeFixedInfo(LocalDate today) {

        List<FixedSchedule> fixedList =
                fixedScheduleRepository.findAll();

        List<FixedSchedule> filteredList = new ArrayList<>();

        for (FixedSchedule f : fixedList) {
            if (f.getEndDate() == null ||
                    !f.getEndDate().isBefore(today)) {
                filteredList.add(f);
            }
        }

        if (filteredList.isEmpty()) {
            return "없음";
        }

        String fixedInfo = "";

        for (FixedSchedule f : filteredList) {
            fixedInfo += "- " + f.getTitle()
                    + ": 매주 "
                    + DAY_NAMES[f.getDayOfWeek()]
                    + "요일 "
                    + f.getStartTime()
                    + "~"
                    + f.getEndTime()
                    + "\n";
        }

        return fixedInfo;
    }

    private String callGemini(String prompt) throws Exception {

        String url =
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                        + apiKey;

        JsonNode requestBody =
                objectMapper.readTree("""
                {
                  "contents": [
                    {
                      "parts": [
                        {
                          "text": ""
                        }
                      ]
                    }
                  ]
                }
                """);

        ((com.fasterxml.jackson.databind.node.ObjectNode)
                requestBody
                        .get("contents")
                        .get(0)
                        .get("parts")
                        .get(0))
                .put("text", prompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request =
                new HttpEntity<>(
                        objectMapper.writeValueAsString(requestBody),
                        headers
                );

        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        url,
                        request,
                        String.class
                );

        JsonNode root =
                objectMapper.readTree(response.getBody());

        String resultText =
                root.get("candidates")
                        .get(0)
                        .get("content")
                        .get("parts")
                        .get(0)
                        .get("text")
                        .asText();

        if (resultText.contains("{")) {
            resultText =
                    resultText.substring(
                            resultText.indexOf("{"),
                            resultText.lastIndexOf("}") + 1
                    );
        }

        return resultText;
    }

    private void handleSchedule(AiScheduleDto dto) {

        switch (dto.getAction()) {

            case "add":
                addSchedule(dto);
                break;

            case "add_fixed":
                addFixedSchedule(dto);
                break;

            case "delete":
                deleteSchedule(dto);
                break;

            case "update":
                updateSchedule(dto);
                break;

            default:
                throw new RuntimeException(
                        "알 수 없는 action: " + dto.getAction()
                );
        }
    }

    private void addSchedule(AiScheduleDto dto) {

        System.out.println("일반 일정 추가 시작");

        if (dto.getDate() == null || dto.getDate().isBlank()) {
            dto.setDate(LocalDate.now().toString());
        }

        Schedule newSchedule = new Schedule();

        newSchedule.setTitle(dto.getTitle());
        newSchedule.setDate(LocalDate.parse(dto.getDate()));

        if (dto.getStartTime() != null &&
                !dto.getStartTime().isBlank()) {
            newSchedule.setStartTime(
                    LocalTime.parse(dto.getStartTime())
            );
        }

        if (dto.getEndTime() != null &&
                !dto.getEndTime().isBlank()) {
            newSchedule.setEndTime(
                    LocalTime.parse(dto.getEndTime())
            );
        }

        newSchedule.setCategory(dto.getCategory());

        scheduleRepository.save(newSchedule);

        System.out.println("일반 일정 추가 끝");
    }

    private void addFixedSchedule(AiScheduleDto dto) {

        System.out.println("고정 일정 추가 시작");

        if (dto.getDayOfWeek() == null ||
                dto.getStartTime() == null ||
                dto.getStartTime().isBlank()) {
            return;
        }

        FixedSchedule newFixed = new FixedSchedule();

        newFixed.setTitle(
                dto.getTitle() != null ? dto.getTitle() : "고정일정"
        );

        newFixed.setDayOfWeek(dto.getDayOfWeek());
        newFixed.setStartTime(dto.getStartTime());

        if (dto.getEndTime() != null &&
                !dto.getEndTime().isBlank()) {
            newFixed.setEndTime(dto.getEndTime());
        } else {
            newFixed.setEndTime(
                    LocalTime.parse(dto.getStartTime())
                            .plusHours(1)
                            .toString()
            );
        }

        newFixed.setCategory(
                dto.getCategory() != null ? dto.getCategory() : "기타"
        );

        fixedScheduleRepository.save(newFixed);

        System.out.println("고정 일정 추가 끝");
    }

    private void deleteSchedule(AiScheduleDto dto) {

        System.out.println("삭제 시작");

        if (dto.getTargetTitle() == null ||
                dto.getTargetDate() == null ||
                dto.getTargetDate().isBlank()) {
            return;
        }

        LocalDate delDate =
                LocalDate.parse(dto.getTargetDate());

        scheduleRepository.findAll()
                .stream()
                .filter(s ->
                        s.getTitle().equals(dto.getTargetTitle()) &&
                        s.getDate().equals(delDate)
                )
                .forEach(scheduleRepository::delete);

        System.out.println("삭제 끝");
    }

    private void updateSchedule(AiScheduleDto dto) {

        System.out.println("업데이트 시작");

        if (dto.getTargetTitle() == null ||
                dto.getTargetDate() == null ||
                dto.getTargetDate().isBlank()) {
            return;
        }

        LocalDate updDate =
                LocalDate.parse(dto.getTargetDate());

        scheduleRepository.findAll()
                .stream()
                .filter(s ->
                        s.getTitle().equals(dto.getTargetTitle()) &&
                        s.getDate().equals(updDate)
                )
                .findFirst()
                .ifPresent(s -> {

                    if (dto.getTitle() != null &&
                            !dto.getTitle().isBlank()) {
                        s.setTitle(dto.getTitle());
                    }

                    if (dto.getStartTime() != null &&
                            !dto.getStartTime().isBlank()) {
                        s.setStartTime(
                                LocalTime.parse(dto.getStartTime())
                        );
                    }

                    if (dto.getEndTime() != null &&
                            !dto.getEndTime().isBlank()) {
                        s.setEndTime(
                                LocalTime.parse(dto.getEndTime())
                        );
                    }

                    if (dto.getCategory() != null &&
                            !dto.getCategory().isBlank()) {
                        s.setCategory(dto.getCategory());
                    }

                    scheduleRepository.save(s);
                });

        System.out.println("업데이트 끝");
    }
}