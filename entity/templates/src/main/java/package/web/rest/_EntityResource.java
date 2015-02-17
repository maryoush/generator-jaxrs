package <%=packageName%>.web.rest;

import <%=packageName%>.domain.<%= entityClass %>;
import <%=packageName%>.repository.<%= entityClass %>Repository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing <%= entityClass %>.
 */
@RestController
@RequestMapping("/api")
public class <%= entityClass %>Resource {

    private final Logger log = LoggerFactory.getLogger(<%= entityClass %>Resource.class);

    @Inject
    private <%= entityClass %>Repository <%= entityInstance %>Repository;

    /**
     * POST  /<%= entityInstance %>s -> Create a new <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public void create(@RequestBody <%= entityClass %> <%= entityInstance %>) {
        log.debug("REST request to save <%= entityClass %> : {}", <%= entityInstance %>);
        <%= entityInstance %>Repository.save(<%= entityInstance %>);
    }

    /**
     * GET  /<%= entityInstance %>s -> get all the <%= entityInstance %>s.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<<%= entityClass %>> getAll() {
        log.debug("REST request to get all <%= entityClass %>s");
        return <%= entityInstance %>Repository.findAll();
    }

    /**
     * GET  /<%= entityInstance %>s/:id -> get the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<<%= entityClass %>> get(@PathVariable String id) {
        log.debug("REST request to get <%= entityClass %> : {}", id);
        return Optional.ofNullable(<%= entityInstance %>Repository.findOne(id))
            .map(<%= entityInstance %> -> new ResponseEntity<>(
                <%= entityInstance %>,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /<%= entityInstance %>s/:id -> delete the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public void delete(@PathVariable String id) {
        log.debug("REST request to delete <%= entityClass %> : {}", id);
        <%= entityInstance %>Repository.delete(id);
    }
}
