package <%=packageName%>.repository;

import <%=packageName%>.domain.<%=entityClass%>;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * Spring Data MongoDB repository for the <%= entityClass %> entity.
 */
public interface <%=entityClass%>Repository extends MongoRepository<<%=entityClass%>,String>{
<% if (fieldsContainOwnerManyToMany==true) { %>
    @Query("select <%= entityInstance %> from <%= entityClass %> <%= entityInstance %> <% for (relationshipId in relationships) {
    if (relationships[relationshipId].relationshipType == 'many-to-many' && relationships[relationshipId].ownerSide == true) { %>left join fetch <%=entityInstance%>.<%=relationships[relationshipId].otherEntityName%>s<%} }%> where <%=entityInstance%>.id =:id")
    <%=entityClass%> findOneWithEagerRelationships(@Param("id") Long id);
<% } %>
}
