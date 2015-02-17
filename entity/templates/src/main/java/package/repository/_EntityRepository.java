package <%=packageName%>.repository;

import <%=packageName%>.domain.<%=entityClass%>;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Spring Data MongoDB repository for the <%= entityClass %> entity.
 */
public interface <%=entityClass%>Repository extends MongoRepository<<%=entityClass%>,String>{

}
