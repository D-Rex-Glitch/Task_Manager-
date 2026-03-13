package com.example.taskmanagement.service;

import com.example.taskmanagement.dto.TaskPageResponse;
import com.example.taskmanagement.dto.TaskRequest;
import com.example.taskmanagement.dto.TaskResponse;
import com.example.taskmanagement.entity.Role;
import com.example.taskmanagement.entity.Task;
import com.example.taskmanagement.entity.TaskPriority;
import com.example.taskmanagement.entity.TaskStatus;
import com.example.taskmanagement.entity.User;
import com.example.taskmanagement.exception.BadRequestException;
import com.example.taskmanagement.exception.ResourceNotFoundException;
import com.example.taskmanagement.repository.TaskRepository;
import com.example.taskmanagement.repository.UserRepository;
import com.example.taskmanagement.security.UserPrincipal;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public TaskPageResponse getTasks(TaskStatus status, TaskPriority priority, int page, int size, String sortBy, String direction) {
        String resolvedSort = ("priority".equalsIgnoreCase(sortBy) || "dueDate".equalsIgnoreCase(sortBy)) ? sortBy : "dueDate";
        Sort sort = Sort.by("desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC, resolvedSort);
        Pageable pageable = PageRequest.of(page, size, sort);

        User currentUser = getCurrentUser();
        boolean admin = currentUser.getRole() == Role.ADMIN;

        Specification<Task> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (!admin) {
                predicates.add(cb.equal(root.get("owner").get("id"), currentUser.getId()));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };

        Page<Task> taskPage = taskRepository.findAll(spec, pageable);
        List<TaskResponse> content = taskPage.getContent().stream().map(this::toResponse).toList();

        return new TaskPageResponse(content, taskPage.getNumber(), taskPage.getSize(), taskPage.getTotalElements(), taskPage.getTotalPages());
    }

    public TaskResponse getTaskById(Long id) {
        Task task = getAuthorizedTask(id);
        return toResponse(task);
    }

    public TaskResponse createTask(TaskRequest request) {
        User currentUser = getCurrentUser();
        Task task = new Task();
        applyRequest(task, request);
        task.setOwner(currentUser);
        return toResponse(taskRepository.save(task));
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = getAuthorizedTask(id);
        applyRequest(task, request);
        return toResponse(taskRepository.save(task));
    }

    public TaskResponse markCompleted(Long id) {
        Task task = getAuthorizedTask(id);
        task.setStatus(TaskStatus.DONE);
        return toResponse(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        Task task = getAuthorizedTask(id);
        taskRepository.delete(task);
    }

    private Task getAuthorizedTask(Long id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.ADMIN && !task.getOwner().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Task not accessible");
        }
        return task;
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserPrincipal userPrincipal)) {
            throw new BadRequestException("Invalid authentication context");
        }
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void applyRequest(Task task, TaskRequest request) {
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription().trim());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
    }

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getOwner().getEmail()
        );
    }
}
